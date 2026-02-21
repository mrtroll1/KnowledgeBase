# Lesson 6 Quiz Answers

---

### Answer 1: Buffer Overflow vs. Buffer Over-Read

**Buffer Overflow (Morris Worm):**

- The attacker causes the program to **write** more data into a memory region than it can hold. The excess data overwrites adjacent memory, including control structures like the return address.
- Consequence: the attacker **gains code execution**. By overwriting the return address, they redirect the CPU to run their own code (shellcode).
- C example: `strcpy(buffer, attacker_input);` — where `attacker_input` is longer than `buffer`. `strcpy` has no length limit, so it writes past the end of the buffer.

**Buffer Over-Read (Heartbleed):**

- The attacker causes the program to **read** more data from a memory region than it actually contains. The program reads past the valid data into whatever is adjacent in memory.
- Consequence: the attacker **leaks sensitive data**. The server reads its own private keys, session tokens, and passwords from adjacent memory and sends them to the attacker. The attacker does not gain code execution directly — they gain information.
- C example: `memcpy(response, payload, claimed_length);` — where `claimed_length` is larger than the actual payload. `memcpy` reads past the end of the payload into adjacent memory.

**What they share:** Both are memory safety bugs caused by missing bounds checks. Both exploit C's fundamental property of not automatically verifying that memory accesses stay within their intended boundaries.

**How they differ:** Overflow corrupts the program's own memory (write). Over-read leaks the program's memory to the attacker (read). Overflow gives control. Over-read gives information.

---

### Answer 2: Perfect Forward Secrecy and Heartbleed

**a) Without PFS (RSA key exchange):**

With RSA key exchange, the client encrypts a session secret using the server's public key, and the server decrypts it with its private key. The same long-term private key is used for every session.

If the attacker extracts the private key via Heartbleed, they can:

1. **Decrypt all recorded past traffic.** Every session over the past six months used the same private key for the key exchange. The attacker has the recordings and now has the key. They can decrypt everything: login credentials, financial data, personal information.
2. **Decrypt all future traffic** until the server rotates its key (which requires getting a new certificate).
3. **Impersonate the server** using the stolen private key to perform man-in-the-middle attacks.

**Everything is compromised** — past, present, and future.

**b) With PFS (ECDHE key exchange):**

With ECDHE (Elliptic Curve Diffie-Hellman Ephemeral), each TLS session generates a unique, temporary ("ephemeral") key pair. The session keys are derived from a Diffie-Hellman exchange, not encrypted with the server's long-term key. After the session ends, the ephemeral keys are deleted.

If the attacker extracts the server's private key:

1. **Past recorded traffic is safe.** Each past session used a unique ephemeral key that no longer exists. The server's long-term private key cannot decrypt those sessions because it was only used for authentication (proving the server's identity), not for encryption.
2. **Active sessions at the moment of the leak may be at risk** — the attacker could potentially interfere with ongoing connections.
3. **The attacker can impersonate the server** going forward, so the certificate still needs to be revoked and replaced.

The critical difference: PFS ensures that compromising the long-term key does not retroactively compromise past communications. This is why it is called "forward" secrecy — secrecy is preserved going forward in time even after a key compromise.

---

### Answer 3: The One-Line Fix

The bounds check goes immediately after reading the claimed length, before any memory access:

```c
n2s(p, payload_length);  // read claimed length from client

// THE FIX: reject if the claimed payload exceeds the actual record
if (1 + 2 + payload_length + 16 > record_length) {
    return 0;
}

payload = p;
response = OPENSSL_malloc(1 + 2 + payload_length + padding);
memcpy(response, payload, payload_length);
```

**Why it works:** The `record_length` is the actual number of bytes received from the network — the server measured this itself, so it is trustworthy. The check verifies that the client's claimed `payload_length`, plus the overhead bytes (1 byte for type, 2 bytes for the length field, and 16 bytes of padding), does not exceed the actual record size. If the client claims a length larger than what it actually sent, the message is silently discarded before `memcpy` ever runs.

The key insight: the fix replaces client-asserted truth (the claimed length) with server-verified truth (the actual record length). Never trust the client's claim about how much data it sent when you can measure it yourself.
