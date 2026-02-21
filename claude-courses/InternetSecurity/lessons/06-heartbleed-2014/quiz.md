# Lesson 6 Quiz: Heartbleed — Memory Safety

---

### Question 1: Buffer Overflow vs. Buffer Over-Read

Explain the difference between a **buffer overflow** (as in the Morris Worm, Lesson 1) and a **buffer over-read** (as in Heartbleed). For each one:

- What does the attacker cause the program to do?
- What is the consequence for the attacker?
- Give a one-line C code example that demonstrates the pattern.

---

### Question 2: Perfect Forward Secrecy and Heartbleed

An attacker has been recording encrypted traffic to `bank.example.com` for the past six months. Then Heartbleed is disclosed, and the attacker uses the vulnerability to extract the bank's TLS private key from server memory.

- **a)** If the bank's server was configured **without** Perfect Forward Secrecy (e.g., using RSA key exchange), what can the attacker do with the private key? What is compromised?
- **b)** If the bank's server was configured **with** Perfect Forward Secrecy (e.g., using ECDHE key exchange), what changes? Why?

---

### Question 3: The One-Line Fix

Here is the vulnerable heartbeat code (simplified):

```c
n2s(p, payload_length);  // read claimed length from client
payload = p;             // point to start of payload data
response = OPENSSL_malloc(1 + 2 + payload_length + padding);
memcpy(response, payload, payload_length);  // copy and echo back
```

The variable `record_length` contains the actual total size of the TLS record received from the client.

Write the bounds check that would have prevented Heartbleed. Where does it go in the code above? Explain in one sentence why your check works.
