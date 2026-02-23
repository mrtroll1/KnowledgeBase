# Lesson 5: The RockYou Breach (2009) — Password Storage

## 32 Million Passwords, Naked on a Hard Drive

In December 2009, a hacker exploited a **SQL injection vulnerability** (the same class of bug from Lesson 3) in RockYou, a company that made widgets and games for social media platforms like Facebook and MySpace. The breach exposed 32 million user accounts.

But the SQL injection was not the real scandal. The real scandal was what the attacker found inside the database:

**Every single password was stored in plain text.**

Not hashed. Not encrypted. Not obscured in any way. Thirty-two million passwords sitting in a column called `password`, readable as-is. `123456`. `iloveyou`. `princess`. Just... right there.

The leaked database was published online and became the most famous password list in cybersecurity. To this day, it ships with penetration testing tools like **Kali Linux** under the name `rockyou.txt`. When security professionals need to test whether a system is vulnerable to password guessing, they reach for the RockYou list first.

Let's understand why plain text storage is catastrophic, and walk through the evolution of how passwords *should* be stored.

---

## Why Plain Text Is Catastrophic

When passwords are stored in plain text, a database breach is a total compromise. There is no second line of defense. The attacker gets every password, for every user, instantly.

But it gets worse. Users **reuse passwords**. Studies consistently show that over 60% of people use the same password on multiple sites. So when RockYou's database leaked, those 32 million passwords were not just keys to RockYou accounts. They were keys to email accounts, bank accounts, and every other service where those users had signed up with the same credentials.

One company's negligence cascaded into millions of compromised accounts across the entire internet.

---

## The Evolution of Password Storage

There are four levels of password storage. Each one fixes the flaw of the previous level. Let's walk through all four.

### Level 1: Plain Text (RockYou, 2009)

```
Database table:
+----------+-------------+
| username | password    |
+----------+-------------+
| alice    | hunter2     |
| bob      | password123 |
| carol    | iloveyou    |
+----------+-------------+
```

**The attack:** The attacker reads the database. That is it. Every password is immediately usable.

```
Attacker's effort: 0 seconds
```

This is what RockYou did. It is the worst possible approach.

### Level 2: Simple Hash (MD5 or SHA1)

Instead of storing the password, you store a **hash** of it. A hash is a one-way function: given the input, you can compute the output, but given the output, you cannot reverse it to get the input.

```javascript
const crypto = require('crypto');
const hash = crypto.createHash('md5').update('hunter2').digest('hex');
// hash = "2ab96390c7dbe3439de74d0c9b0b1767"
```

```
Database table:
+----------+----------------------------------+
| username | password_hash                    |
+----------+----------------------------------+
| alice    | 2ab96390c7dbe3439de74d0c9b0b1767 |
| bob      | 482c811da5d5b4bc6d497ffa98491e38 |
| carol    | ee8d8728f435fd550f83852aabab5234 |
+----------+----------------------------------+
```

**The attack: Rainbow Tables.** Here is the critical insight: MD5 is deterministic. `MD5("hunter2")` **always** produces `2ab96390c7dbe3439de74d0c9b0b1767`, on every computer, every time. So an attacker can precompute the MD5 hash for every common password and store them in a lookup table:

```
Rainbow table (precomputed):
+----------------------------------+-------------+
| hash                             | password    |
+----------------------------------+-------------+
| e10adc3949ba59abbe56e057f20f883e | 123456      |
| 2ab96390c7dbe3439de74d0c9b0b1767 | hunter2     |
| 5f4dcc3b5aa765d61d8327deb882cf99 | password    |
| ... millions more ...            |             |
+----------------------------------+-------------+
```

The attacker just looks up each hash in the table. Cracking 32 million accounts takes seconds.

```
Attacker's effort: seconds (one table lookup per hash)
```

### Level 3: Salted Hash (SHA256 + Random Salt)

A **salt** is a random string generated for each user, stored alongside the hash. You hash the salt combined with the password:

```javascript
const crypto = require('crypto');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256')
        .update(salt + password)
        .digest('hex');
    return { salt, hash };
}

// alice: salt = "a1b2c3d4..." → SHA256("a1b2c3d4..." + "hunter2") = "7f3a..."
// bob:   salt = "e5f6g7h8..." → SHA256("e5f6g7h8..." + "hunter2") = "9c4b..."
// Same password, different hashes!
```

```
Database table:
+----------+------------------+----------------------------------+
| username | salt             | password_hash                    |
+----------+------------------+----------------------------------+
| alice    | a1b2c3d4e5f6...  | 7f3a8b2c...                      |
| bob      | e5f6g7h8i9j0...  | 9c4b1d3e...                      |
+----------+------------------+----------------------------------+
```

Now rainbow tables are useless. Even if alice and bob both use `hunter2`, their hashes are completely different because their salts are different. The attacker would need a separate rainbow table for every salt — which defeats the entire purpose.

**The attack: GPU Brute Force.** Salting stops rainbow tables, but it does not slow down hashing. SHA256 is designed to be fast. A modern GPU can compute **billions** of SHA256 hashes per second.

```
Attacker's approach:
  For each user's salt:
    Try SHA256(salt + "123456")  — match? no
    Try SHA256(salt + "password") — match? no
    Try SHA256(salt + "hunter2")  — match? YES

GPU speed: ~10 billion SHA256 hashes/sec
Time to try 10 billion common passwords: ~1 second per user
```

Salting alone is not enough because the hash function is too fast.

### Level 4: Slow Hash (bcrypt / scrypt / Argon2)

The solution: use a hash function that is **intentionally slow**. bcrypt, scrypt, and Argon2 are designed so that each hash computation takes a significant amount of time — typically 100-300 milliseconds.

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const saltRounds = 12;  // cost factor — higher = slower
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
    // "$2b$12$LJ3m4ys3Lk0TSwMvkR1ROeIhB3ufGn/GnW8Fzp7xKbGOmGfYPSWe"
}

async function verifyPassword(password, storedHash) {
    const match = await bcrypt.compare(password, storedHash);
    return match;  // true or false
}
```

The bcrypt output includes the algorithm, cost factor, salt, and hash all in one string. No separate salt column needed.

**The attack: economically infeasible.** At cost factor 12, bcrypt takes about 0.3 seconds per hash. Compare that to SHA256:

```
SHA256:  10,000,000,000 hashes/sec  (10 billion)
bcrypt:                3 hashes/sec  (at cost=12)

That is a factor of ~3,000,000,000x slower.

Brute-forcing a database of 10,000 common passwords per user:
  SHA256: 0.000001 seconds per user  → all 32M users in ~32 seconds
  bcrypt: 3,333 seconds per user     → all 32M users in ~3,400 YEARS
```

---

## Timing Comparison: See It for Yourself

```
+--------------------+------------------+---------------------------+
| Method             | Hashes/sec       | Time to try 10B passwords |
+--------------------+------------------+---------------------------+
| MD5 (GPU)          | ~25 billion      | < 1 second                |
| SHA256 (GPU)       | ~10 billion      | ~1 second                 |
| bcrypt cost=10     | ~10              | ~31 YEARS                 |
| bcrypt cost=12     | ~3               | ~105 YEARS                |
| Argon2 (tuned)     | ~2               | ~158 YEARS                |
+--------------------+------------------+---------------------------+

  MD5:    ████████████████████████████████████████ 25 billion/sec
  SHA256: ████████████████████████████████         10 billion/sec
  bcrypt: ▏                                        3/sec

  (not to scale — bcrypt bar would be invisible at this scale)
```

---

## Inside bcrypt: Why Is It Slow?

bcrypt is not just "SHA256 but slower." It is built on a completely different foundation — the **Blowfish** block cipher (Bruce Schneier, 1993). Blowfish has an unusual property: its **key setup is extremely expensive** compared to the actual encryption. Most ciphers optimize for fast key setup. bcrypt's designers (Provos & Mazieres, 1999) exploited this by making the key setup even more expensive on purpose, creating a variant called **Eksblowfish** ("expensive key schedule").

### What happens when you call `bcrypt.hash(password, 12)`

```
Step 1: Parse cost factor → 2^12 = 4,096 rounds

Step 2: Generate 128-bit random salt

Step 3: Initialize Blowfish internal state
        → 18 "P-box" subkeys (each 32 bits)
        → 4 "S-boxes" (each 256 × 32 bits)
        → Total: ~4 KB of mutable state

Step 4: THE EXPENSIVE PART — 4,096 iterations:
        ┌─────────────────────────────────────────┐
        │  for i = 0 to 4,095:                    │
        │    re-derive all 4 KB of internal state  │
        │      using the PASSWORD as key           │
        │    re-derive all 4 KB of internal state  │
        │      using the SALT as key               │
        └─────────────────────────────────────────┘
        Each round depends on the previous round's output.
        Cannot be parallelized. Cannot be shortcutted.

Step 5: Encrypt the constant "OrpheanBeholderScryDoubt"
        64 times using the final state

Step 6: Output: $2b$12$<salt_base64><hash_base64>
```

The cost factor is exponential: cost=12 means 4,096 rounds, cost=13 means 8,192 rounds. Each +1 doubles the work. This is how bcrypt "ages" — as hardware gets faster, you increase the cost factor.

### Why GPUs do not help

SHA256 is a tight loop of simple arithmetic — perfect for GPUs with thousands of tiny cores. bcrypt's inner loop requires 4 KB of fast-access memory per hash, with random S-box lookups that thrash the cache. GPUs have very limited per-core memory. This was deliberate — bcrypt is **memory-hard**, not just CPU-hard.

```
SHA256 internals:           bcrypt internals:

  password                    password + salt
     │                           │
     ▼                           ▼
  ┌──────┐                  ┌──────────────────┐
  │1 pass│                  │ round 1: derive   │◄──┐
  │64 ops│                  │ 4 KB state from   │   │
  └──┬───┘                  │ password and salt │   │
     │                      └────────┬──────────┘   │
     ▼                               │              │
   done                              ▼              │
                             ┌──────────────┐       │
                             │ round 2:     │       │
                             │ re-derive    │───────┘
                             │ from round 1 │
                             └──────────────┘
                                   ...
                             (×4,096 at cost=12)
                                   │
                                   ▼
                                 done
```

scrypt and Argon2 push this further — scrypt requires megabytes of RAM per hash, and Argon2 lets you tune time and memory independently.

### The 72-byte password limit

Blowfish's key schedule XORs the key material into its 18 P-boxes (18 × 4 bytes = 72 bytes). If your password is longer than 72 bytes, the extra bytes simply have no slot in the cipher — they are silently ignored. This is not a bug in the npm library; it is a physical constraint of the underlying cipher.

Most npm bcrypt libraries do **not** warn you about this. Two passwords that share the same first 72 bytes will produce the same hash. The pragmatic fix is to pre-hash with SHA256 before feeding to bcrypt:

```javascript
// Normalize any-length password to 32 bytes, then bcrypt that
const normalized = crypto.createHash('sha256').update(password).digest('hex');
const hash = await bcrypt.hash(normalized, 12);
```

This is what Dropbox uses in production. Argon2, the modern alternative, does not have this limitation.

### bcrypt does not make weak passwords safe

The math is important here. bcrypt at cost 12 does ~3 hashes/sec per core. That sounds safe until you do the attacker math:

```
Spray top-10 passwords across 1M users:
  1,000,000 × 10 = 10,000,000 hashes
  10M ÷ 3/sec = ~38 days on 1 core
  With a rented 32-core server: ~1 day

Target 1,000 high-value users with a 100K wordlist:
  1,000 × 100,000 = 100,000,000 hashes
  With 32 cores: ~12 days
```

bcrypt buys **time**, not invincibility. For users with `123456` as their password, even "expensive" is cheap enough. This is why bcrypt must be combined with weak-password rejection at signup, breach-list checking, and multi-factor authentication.

---

## A/B Comparison: Code You Might Write

### A: The Wrong Way (MD5 or SHA256)

```javascript
// BAD — do not use this for passwords
const crypto = require('crypto');

function storePassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function checkPassword(inputPassword, storedHash) {
    const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
    return inputHash === storedHash;
}
```

This looks reasonable. `crypto` is a built-in Node.js module. SHA256 is a "strong" hash. But it is completely wrong for passwords because it is far too fast.

### B: The Right Way (bcrypt)

```javascript
// GOOD — use this
const bcrypt = require('bcrypt');

async function storePassword(password) {
    const hash = await bcrypt.hash(password, 12);  // cost factor 12
    return hash;
}

async function checkPassword(inputPassword, storedHash) {
    const match = await bcrypt.compare(inputPassword, storedHash);
    return match;
}
```

The code is barely more complex. The API is almost identical. The difference is that `bcrypt.hash` takes ~300ms instead of ~0.0001ms, and that makes all the difference.

---

## Hands-On: Measure the Difference Yourself

Run this Node.js script to see the speed difference firsthand:

```javascript
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const password = 'hunter2';

// MD5
console.time('MD5 (1000 hashes)');
for (let i = 0; i < 1000; i++) {
    crypto.createHash('md5').update(password).digest('hex');
}
console.timeEnd('MD5 (1000 hashes)');

// SHA256
console.time('SHA256 (1000 hashes)');
for (let i = 0; i < 1000; i++) {
    crypto.createHash('sha256').update(password).digest('hex');
}
console.timeEnd('SHA256 (1000 hashes)');

// bcrypt (only 3 hashes — it is THAT slow)
(async () => {
    console.time('bcrypt cost=12 (3 hashes)');
    for (let i = 0; i < 3; i++) {
        await bcrypt.hash(password, 12);
    }
    console.timeEnd('bcrypt cost=12 (3 hashes)');
})();
```

**Expected output** (approximate):
```
MD5 (1000 hashes): ~2ms
SHA256 (1000 hashes): ~3ms
bcrypt cost=12 (3 hashes): ~900ms
```

MD5 and SHA256 do 1000 hashes in the time it takes bcrypt to do 3. That is exactly the point. When you are *verifying* a legitimate user's login, 300ms is unnoticeable. When an attacker is trying billions of guesses, 300ms per guess is a wall.

---

## The RockYou Top 10: A Window Into Human Nature

Here are the top 10 passwords from the RockYou leak:

```
 Rank  Password       Count
 ----  ----------     --------
  1.   123456         290,731
  2.   12345          79,078
  3.   123456789      76,790
  4.   password       61,958
  5.   iloveyou       51,622
  6.   princess       35,231
  7.   rockyou        22,588
  8.   1234567        21,726
  9.   12345678       20,553
 10.   abc123         17,542
```

Nearly 300,000 users had the password `123456`. These patterns have barely changed since 2009. The most common passwords in 2024 breach data are almost identical.

This is why password hashing alone is not enough. You also need:

- **Rate limiting** — lock accounts or add delays after failed attempts
- **Breach detection** — check passwords against known leaked lists (services like "Have I Been Pwned")
- **Multi-factor authentication** — a second factor that the attacker cannot steal from a database
- **Password complexity requirements** — though these are less effective than we once thought

---

## Key Takeaways

1. **Use bcrypt, scrypt, or Argon2.** Never use MD5, SHA1, or SHA256 for password storage. These general-purpose hash functions are designed to be fast, which is exactly what you do not want.

2. **Never roll your own password storage.** Use well-tested libraries. In Node.js, that means `bcrypt`. In Python, `passlib` or `argon2-cffi`. In Go, `golang.org/x/crypto/bcrypt`. The library handles salting, hashing, and verification correctly.

3. **The goal is economic infeasibility.** You cannot make cracking impossible. You can make it so slow that it is not worth the attacker's time and electricity. bcrypt at cost factor 12 means cracking a single strong password takes years of GPU time.

4. **RockYou's real failure was not the SQL injection.** Breaches happen. The unforgivable failure was that when the breach happened, there was nothing protecting the passwords. Defense in depth means assuming each layer will eventually fail, and building the next layer anyway.

5. **Humans are bad at choosing passwords.** The RockYou list proves it. This is why modern security does not rely on password strength alone — it layers hashing, rate limiting, breach detection, and multi-factor authentication.
