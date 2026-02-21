# Lesson 5 Quiz: The RockYou Breach — Password Storage

---

### Question 1: Why Salting Alone Is Not Enough

A developer argues: "I store passwords using SHA256 with a unique random salt per user. Rainbow tables are useless against this. My password storage is secure."

Explain why this developer's approach is still vulnerable. What specific attack would work, and why?

---

### Question 2: Brute-Force Timing Calculation

An attacker has stolen a database of password hashes. They want to try a dictionary of 1 million common passwords against a single user's hash.

Calculate how long this would take for each method:

- **a)** MD5 (no salt), using a GPU that computes 25 billion MD5 hashes per second
- **b)** SHA256 with a unique salt, using a GPU at 10 billion SHA256 hashes per second
- **c)** bcrypt with cost factor 12, at approximately 3 hashes per second

---

### Question 3: Spot the Vulnerability

A junior developer wrote this password registration and login code for a Node.js application:

```javascript
const crypto = require('crypto');

// Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, hash]);
    res.send('Registered!');
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const user = db.query('SELECT * FROM users WHERE username = ? AND password_hash = ?',
        [username, hash]);
    if (user) {
        res.send('Welcome!');
    } else {
        res.send('Invalid credentials');
    }
});
```

Identify **all** the security problems with the password handling in this code. (Hint: there are at least three.)

---

### Question 4: Why bcrypt Over SHA256 + Salt

Your colleague says: "SHA256 is a cryptographically secure hash function. Adding a salt defeats rainbow tables. I do not see why we need bcrypt when we already have SHA256 + salt."

Write a clear explanation for your colleague that addresses their specific reasoning. Why is bcrypt fundamentally better than SHA256 + salt for password storage? What property does bcrypt have that SHA256 lacks?
