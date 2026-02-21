# Lesson 6: Heartbleed (2014) — Memory Safety

## The Bug That Got Its Own Logo

On April 7, 2014, a vulnerability was publicly disclosed in OpenSSL, the most widely used cryptographic library on the internet. It was assigned **CVE-2014-0160**, but the world came to know it as **Heartbleed**.

It affected an estimated **17% of all SSL-enabled web servers** — roughly 500,000 servers, including major services like Yahoo Mail, the Canada Revenue Agency, and countless others. It was the first software vulnerability to get its own logo, its own website (heartbleed.com), and mainstream news coverage. Your parents might have heard about this one.

The bug was in OpenSSL's implementation of the **TLS Heartbeat extension**. The fix was a single bounds check — one `if` statement. But the damage that missing check caused was staggering: it allowed any attacker, anywhere on the internet, to silently read chunks of a server's private memory. Private keys. Session tokens. Passwords. All without leaving a trace in the server logs.

Let's understand exactly how.

---

## What Is TLS Heartbeat?

TLS (Transport Layer Security) is the protocol that puts the "S" in HTTPS. When your browser connects to a server over TLS, the two sides establish an encrypted channel.

Sometimes, that channel sits idle for a while — the user is reading a page, not making requests. The **Heartbeat extension** (RFC 6520) is a keep-alive mechanism to check that the connection is still open without doing a full TLS renegotiation.

It works like this:

```
Client: "Hey, are you still there? Here is some data: HELLO
         The data is 5 bytes long. Please echo it back."

Server: "Yep, I'm here. HELLO"
```

That is all a heartbeat does. The client sends a payload and its length. The server reads that many bytes and echoes them back. A simple ping-pong.

---

## The Bug: Trust Without Verification

Here is where it breaks. The heartbeat message contains two things:

1. **A payload** (the actual data bytes)
2. **A length field** (a number claiming how many bytes the payload is)

The server was supposed to echo back `length` bytes of the payload. But the server **trusted the length field without checking it against the actual payload size**.

```
Normal heartbeat request:
  Payload:  "HELLO"  (5 bytes)
  Length:   5

  Server reads 5 bytes from the payload → "HELLO" → sends back "HELLO"
  ✓ Everything matches. No problem.

Heartbleed attack:
  Payload:  "X"  (1 byte)
  Length:   65535  (claims 64KB)

  Server reads 1 byte of payload → "X"
  Server keeps reading 65534 MORE bytes from its own process memory
  → "X" + [whatever happens to be in adjacent memory]
  → sends it all back to the client
```

The server read past the end of the payload buffer and into its own memory. Whatever data happened to be sitting next to the heartbeat payload in the server's RAM — private keys, session cookies, other users' passwords, fragments of HTTP requests — got scooped up and sent to the attacker.

---

## The Anatomy of the Attack

Here is the data flow, step by step:

```
                    ┌─────────────────────────────────┐
                    │         SERVER MEMORY            │
                    │                                  │
                    │  ┌──────────┐ ┌────────────────┐ │
                    │  │Heartbeat │ │ Adjacent memory │ │
                    │  │ payload  │ │                 │ │
                    │  │  "X"     │ │ TLS private key │ │
                    │  │ (1 byte) │ │ Session tokens  │ │
                    │  │          │ │ User passwords  │ │
                    │  │          │ │ HTTP headers    │ │
                    │  └──────────┘ └────────────────┘ │
                    │  ▲                          ▲    │
                    │  │     memcpy reads ALL     │    │
                    │  │◄─────── 65535 bytes ────►│    │
                    │  │     (past the boundary)  │    │
                    └──┼──────────────────────────┼────┘
                       │                          │
                       └──────────┬───────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────┐
                    │    SENT BACK TO ATTACKER         │
                    │    "X" + private key fragments   │
                    │    + session tokens + ...        │
                    └─────────────────────────────────┘
```

The attacker did not need to authenticate. They did not need a valid session. They did not need to exploit any other vulnerability first. They just sent a malformed heartbeat request to any HTTPS server running a vulnerable version of OpenSSL, and the server handed back up to 64KB of its own memory.

And they could do it again. And again. Each time getting a different random slice of the server's memory. Over minutes or hours, an attacker could reconstruct complete private keys, intercept active sessions, and read credentials in transit.

**There was no trace in the server logs.** Heartbeat requests were routine protocol messages, not logged by default. Servers were leaking their most sensitive data with no way to know it had happened.

---

## The Vulnerable Code

Here is a simplified version of the actual vulnerable code in OpenSSL (from `ssl/d1_both.c` and `ssl/t1_lib.c`):

### A: Vulnerable Version

```c
/* Read the heartbeat message from the client */
unsigned char *payload;
unsigned int payload_length;

/* Extract the claimed length from the message header */
n2s(p, payload_length);    // reads 2 bytes into payload_length
                           // (attacker controls this value!)

/* Point to the start of the actual payload data */
payload = p;

/* Allocate a response buffer and copy the payload into it */
unsigned char *response = OPENSSL_malloc(1 + 2 + payload_length + padding);
memcpy(response, payload, payload_length);
//      ^^^^^^^^  ^^^^^^^  ^^^^^^^^^^^^^^
//      dest      src      HOW MANY BYTES TO COPY
//
// payload_length comes from the CLIENT, not from the actual data size!
// If the client says 65535 but only sent 1 byte, memcpy reads 65534
// bytes past the end of the payload — straight from server memory.
```

The problem is on the `memcpy` line. `payload_length` is the value the client *claimed*, not the actual length of the data received. There is no check.

### B: Fixed Version (the actual patch)

```c
/* Read the heartbeat message from the client */
unsigned char *payload;
unsigned int payload_length;

/* Extract the claimed length from the message header */
n2s(p, payload_length);

/* THE FIX: verify that the claimed length matches reality */
if (1 + 2 + payload_length + 16 > record_length) {
    return 0;  // silently discard — the message is malformed
}

payload = p;

unsigned char *response = OPENSSL_malloc(1 + 2 + payload_length + padding);
memcpy(response, payload, payload_length);
```

One `if` statement. That is the entire fix. Check that the claimed length does not exceed the actual data received. If it does, discard the message.

This two-line fix was committed by Stephen Henson on April 7, 2014, in OpenSSL commit `96db902`. Two lines of code to fix a vulnerability that compromised half a million servers.

---

## Buffer Over-Read vs. Buffer Overflow

In Lesson 1 (the Morris Worm), we saw a **buffer overflow**: writing *past* the end of a buffer, corrupting adjacent memory and hijacking program execution.

Heartbleed is a **buffer over-read**: reading *past* the end of a buffer, leaking adjacent memory to the attacker.

```
Buffer OVERFLOW (Lesson 1 — Morris Worm):
  ┌──────────┐┌──────────────┐
  │  Buffer   ││ Return addr  │
  │           ││              │
  │ AAAAAAAAAA││ OVERWRITTEN! │  ← attacker WRITES past the buffer
  └──────────┘└──────────────┘
  Result: attacker controls program execution

Buffer OVER-READ (Lesson 6 — Heartbleed):
  ┌──────────┐┌──────────────┐
  │  Buffer   ││ Private keys │
  │           ││ Passwords    │
  │  "X"      ││ ← LEAKED!   │  ← server READS past the buffer
  └──────────┘└──────────────┘
  Result: attacker reads server's secrets
```

Both are memory safety bugs. Both come from C's lack of automatic bounds checking. The Morris Worm was in 1988. Heartbleed was in 2014 — twenty-six years later, the same fundamental class of error.

This is not because C programmers are careless. It is because C the language does not prevent this. When you call `memcpy(dest, src, n)`, C will copy exactly `n` bytes, regardless of whether `src` actually has `n` bytes to give. There is no runtime check. This is a design choice in C — and it is why languages like **Rust**, **Go**, and managed languages like **Java** and **JavaScript** exist with automatic bounds checking built in.

---

## Why It Was Devastating: Perfect Forward Secrecy

The worst consequence of Heartbleed was that attackers could extract the server's **TLS private key** from memory. With the private key, an attacker could:

1. **Decrypt recorded traffic.** If someone had been recording encrypted traffic to a server (which intelligence agencies routinely do), they could now decrypt all of it — past, present, and future.

2. **Impersonate the server.** With the private key, an attacker could perform a man-in-the-middle attack, pretending to be the real server.

There was one defense: **Perfect Forward Secrecy (PFS)**. With PFS, each TLS session generates a unique, temporary key pair. Even if the server's long-term private key is stolen, past sessions cannot be decrypted because their temporary keys no longer exist.

```
Without PFS:
  Server private key leaked → ALL past + future sessions compromised

With PFS (ECDHE key exchange):
  Server private key leaked → only ACTIVE sessions at risk
  Past sessions used ephemeral keys that were already deleted → safe
```

In 2014, most servers did not use PFS. The Heartbleed disclosure accelerated its adoption dramatically. Today, PFS is standard practice.

---

## Hands-On: Simulate the Over-Read

Here is a JavaScript simulation that demonstrates the core concept. It is not real exploitation — just a program that shows what happens when you read past the end of your data without bounds checking.

```javascript
// Simulating server memory as one big buffer
// In real life, this is RAM containing mixed data from the process
const serverMemory = Buffer.alloc(256);

// Write the heartbeat payload at the start (what the client sent)
const payload = Buffer.from("HELLO");
payload.copy(serverMemory, 0);

// Simulate other data sitting in adjacent memory
// (In a real server, this would be keys, tokens, passwords, etc.)
Buffer.from("SECRET_KEY=a8f3k2j5x9").copy(serverMemory, 5);
Buffer.from(" session=user:admin;token:abc123").copy(serverMemory, 26);
Buffer.from(" password:hunter2").copy(serverMemory, 57);

// --- VULNERABLE version: trusts the client-provided length ---
function heartbeatVulnerable(claimedLength) {
    // Read claimedLength bytes starting from the payload,
    // regardless of actual payload size
    const response = serverMemory.slice(0, claimedLength);
    return response.toString('utf8');
}

// --- SAFE version: checks the length ---
function heartbeatSafe(claimedLength, actualPayloadLength) {
    if (claimedLength > actualPayloadLength) {
        return "ERROR: claimed length exceeds actual payload. Discarding.";
    }
    const response = serverMemory.slice(0, claimedLength);
    return response.toString('utf8');
}

// Normal request: client sends 5 bytes, claims 5
console.log("=== Normal heartbeat ===");
console.log("Response:", heartbeatVulnerable(5));
// Output: "HELLO"

// Heartbleed attack: client sends 5 bytes, claims 100
console.log("\n=== Heartbleed attack (vulnerable) ===");
console.log("Response:", heartbeatVulnerable(100));
// Output: "HELLO" + SECRET_KEY + session tokens + passwords...

// Same attack against the fixed version
console.log("\n=== Heartbleed attack (safe) ===");
console.log("Response:", heartbeatSafe(100, 5));
// Output: ERROR message
```

Run this, and you will see the "vulnerable" version happily returns secrets from adjacent memory, while the "safe" version rejects the malformed request. The entire difference is one length check.

---

## Connecting the Threads

Heartbleed and the Morris Worm (Lesson 1) are separated by 26 years, but they share the same root cause: **C does not check memory boundaries for you, and humans forget to do it themselves.**

The Morris Worm exploited `gets()` — a function that reads input with no length limit, allowing a buffer overflow. Heartbleed exploited `memcpy()` with a client-controlled length — reading past the end of valid data.

This is not an indictment of the OpenSSL developers. The heartbeat code was written by a single contributor and reviewed by one maintainer — for software that secured a third of the internet. The problem is systemic: critical infrastructure written in a language that requires manual memory safety, maintained by a skeleton crew of volunteers.

After Heartbleed, the **Core Infrastructure Initiative** was founded to fund critical open-source projects. The push toward memory-safe languages — Rust in particular — gained enormous momentum. The White House issued a report in 2024 recommending that all new critical infrastructure be written in memory-safe languages.

One missing `if` statement. Two lines of code. Half a million compromised servers. That is why memory safety is not academic. It is existential.

---

## Key Takeaways

1. **Heartbleed was a buffer over-read**, not a buffer overflow. The server read past the end of valid data and sent its own memory to the attacker. No code injection was needed — the server leaked its secrets voluntarily.

2. **The fix was one bounds check.** If `claimed_length > actual_length`, discard the message. That is it. The vulnerability existed for two years (introduced in OpenSSL 1.0.1 in March 2012) before it was found.

3. **Never trust client-provided lengths.** This is the same principle as Lesson 1: any data that crosses a trust boundary must be validated. The heartbeat code trusted the client's length field, and the client lied.

4. **Perfect Forward Secrecy limits the blast radius.** Without PFS, a leaked private key compromises all past traffic. With PFS, only active sessions are at risk. This is why PFS is now standard.

5. **Memory safety is not a niche concern.** From the Morris Worm in 1988 to Heartbleed in 2014, the same class of bug — unchecked memory access in C — has caused some of the worst security incidents in computing history. This is the driving force behind Rust, Go, and the broader shift toward memory-safe systems programming.
