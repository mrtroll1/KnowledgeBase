# Lesson 5 Quiz Answers

---

### Answer 1: Why Salting Alone Is Not Enough

The developer is correct that salting defeats rainbow tables. With a unique salt per user, an attacker cannot precompute hashes in advance. However, salting does **not** slow down brute-force attacks against individual accounts.

SHA256 is a general-purpose cryptographic hash designed to be fast. A modern GPU can compute approximately **10 billion SHA256 hashes per second**. With a salted hash, the attacker simply takes the user's known salt and runs:

```
SHA256(salt + "123456")    — match? no
SHA256(salt + "password")  — match? no
SHA256(salt + "hunter2")   — match? no
... (billions more per second)
```

The salt is stored in the database alongside the hash (it has to be, for verification to work), so the attacker has it. The salt only prevents the attacker from reusing precomputed work across users. It does nothing to slow down the per-user attack.

For the common passwords that most people choose (from lists like RockYou), an attacker can crack each account in under a second. Salt protects against one type of attack (precomputation) but not another (brute force). You need both: salt **and** a slow hash function.

---

### Answer 2: Brute-Force Timing Calculation

Dictionary: 1,000,000 (1 million) common passwords to try against one user's hash.

**a) MD5 at 25 billion hashes/sec:**

```
1,000,000 / 25,000,000,000 = 0.00004 seconds = 0.04 milliseconds
```

Effectively instant. And with no salt, the attacker computes this once and can look up every user in the database.

**b) SHA256 with salt at 10 billion hashes/sec:**

```
1,000,000 / 10,000,000,000 = 0.0001 seconds = 0.1 milliseconds
```

Still effectively instant. The salt means the attacker must do this separately for each user, but at 0.1ms per user, cracking all 32 million RockYou accounts against the same dictionary would take:

```
32,000,000 * 0.0001 seconds = 3,200 seconds = ~53 minutes
```

**c) bcrypt cost=12 at 3 hashes/sec:**

```
1,000,000 / 3 = 333,333 seconds = ~92.6 hours = ~3.9 days
```

That is 3.9 days for a **single user**. For all 32 million RockYou users:

```
32,000,000 * 333,333 seconds = ~338,000 YEARS
```

**Summary:**

| Method | Time per user | Time for 32M users |
|--------|--------------|---------------------|
| MD5 (no salt) | 0.04 ms | 0.04 ms (one lookup) |
| SHA256 + salt | 0.1 ms | ~53 minutes |
| bcrypt cost=12 | ~3.9 days | ~338,000 years |

This is why bcrypt exists. The 3-billion-fold slowdown transforms a trivial attack into an infeasible one.

---

### Answer 3: Spot the Vulnerability

There are at least three security problems:

**Problem 1: No salt.** The code uses `SHA256(password)` directly, with no salt. Two users with the same password will have the same hash. An attacker can precompute a rainbow table of SHA256 hashes for common passwords and crack the entire database instantly.

**Problem 2: SHA256 is too fast.** Even if a salt were added, SHA256 is a fast hash function. It is designed for speed, not for resistance to brute-force password guessing. The code should use bcrypt, scrypt, or Argon2.

**Problem 3: No rate limiting.** There is no mechanism to slow down or block repeated login attempts. An attacker can submit millions of login requests, each trying a different password, without any delay or lockout. (Note: this is an application-level issue, not just a hashing issue, but it compounds the problem.)

**The fixed version:**

```javascript
const bcrypt = require('bcrypt');

// Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, hash]);
    res.send('Registered!');
});

// Login (with basic rate limiting concept)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (user && await bcrypt.compare(password, user.password_hash)) {
        res.send('Welcome!');
    } else {
        res.send('Invalid credentials');
    }
});
```

Key changes: bcrypt handles salting automatically, the hash is intentionally slow, and the login query fetches the user first and then verifies the password with `bcrypt.compare` (rather than putting the hash directly in the SQL query).

---

### Answer 4: Why bcrypt Over SHA256 + Salt

Your colleague is right about two things: SHA256 is cryptographically secure (it is not broken, and you cannot reverse it), and adding a salt defeats rainbow tables. But these properties are not enough for password storage, because of one critical factor: **speed**.

SHA256 was designed to hash large amounts of data quickly. It is used for file integrity checks, digital signatures, and blockchain computations, where speed is a feature. A modern GPU can compute 10 billion SHA256 hashes per second.

bcrypt was designed with the opposite goal: to be **intentionally, tunably slow**. At cost factor 12, a single bcrypt hash takes about 300 milliseconds. This is the key property that SHA256 lacks — **adjustable computational cost**.

Here is why this matters. When a legitimate user logs in, your server computes one hash to verify their password. Whether that takes 0.0001ms (SHA256) or 300ms (bcrypt), the user does not notice the difference. But an attacker who has stolen the database must compute millions or billions of hashes to guess passwords. The difference between 0.0001ms and 300ms per attempt is the difference between cracking an account in milliseconds and cracking it in years.

Furthermore, bcrypt's cost factor is **tunable**. As hardware gets faster over the years, you increase the cost factor. Cost factor 12 today might become cost factor 14 in five years. SHA256 has no such knob — it is always as fast as the hardware allows.

In short: SHA256 + salt protects against precomputation (rainbow tables). bcrypt protects against precomputation **and** brute force. For password storage, you need both protections.
