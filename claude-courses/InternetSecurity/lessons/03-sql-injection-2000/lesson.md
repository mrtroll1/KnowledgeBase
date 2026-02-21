# Lesson 3: SQL Injection Emerges (~2000)

## The Story

In December 1998, a security researcher named Jeff Forristal — writing under the handle
"rain.forest.puppy" — published an article in Phrack magazine (issue 54) titled "NT Web
Technology Vulnerabilities." Buried in that article was something that would become one of
the most devastating classes of vulnerability in computing history: SQL injection.

Forristal showed that if a web application built SQL queries by pasting user input directly
into the query string, an attacker could manipulate the query's logic. It was an
embarrassingly simple idea. And by 2000, attackers were exploiting it everywhere — against
e-commerce sites, government databases, corporate intranets. Every system that took user
input and fed it to a database was potentially wide open.

Here's the remarkable part: **SQL injection is still in the OWASP Top 10 in 2024.** Over
25 years later. Not because it's hard to fix — it's one of the easiest vulnerabilities to
prevent. But because developers keep making the same mistake: building SQL from strings.

Let's see exactly why.

## The Core Mechanism

You already know SQL. You write queries like this:

```sql
SELECT * FROM users WHERE username = 'alice' AND password = 'hunter2';
```

And you know how web apps work: a user types into a form, the browser sends the data to
your server, and your server does something with it. Often that "something" involves a
database query.

Here's where the vulnerability lives. Imagine you write this server-side code:

```js
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

If the user types `alice` and `hunter2`, the resulting SQL is exactly what you'd expect:

```sql
SELECT * FROM users WHERE username = 'alice' AND password = 'hunter2';
```

Normal. Safe. But what if the user types this as their password?

```
' OR '1'='1
```

Let's walk through the resulting SQL **character by character**.

## Character-by-Character Breakdown

Your template starts building the string. It pastes in the username normally, then reaches
the password section:

```
...AND password = '         <-- your code wrote this opening quote
' OR '1'='1                  <-- this is the user's input
'                            <-- your code wrote this closing quote
```

The assembled SQL is:

```sql
SELECT * FROM users WHERE username = 'alice' AND password = '' OR '1'='1';
```

Read that WHERE clause carefully:

```
password = ''       -- password is empty string? FALSE for most users
OR
'1' = '1'           -- is the string '1' equal to itself? ALWAYS TRUE
```

The OR makes the entire WHERE clause TRUE for **every row in the table**. The database
returns all users. Your login code probably checks "did I get a result?" — and yes, you
did. The attacker is now logged in, usually as the first user in the table (often the
admin).

## ASCII Diagram: Intended vs. Injected

Here is what you *intended* the query structure to be:

```
SELECT * FROM users WHERE username = '[DATA]' AND password = '[DATA]';
                                       ^^^^^                   ^^^^^
                                    user controls           user controls
                                    (just data)             (just data)
```

Here is what the attacker actually produced:

```
SELECT * FROM users WHERE username = 'alice' AND password = '' OR '1'='1';
                                                             ^^^^^^^^^^
                                                             This is NEW SQL LOGIC
                                                             injected by the attacker
```

The single quote in the attacker's input **closed the string literal early**, and
everything after it became SQL commands, not data. That's the entire trick. The database
can't tell the difference between your SQL and the attacker's SQL because, by the time it
sees the query, it's all one string.

## More Dangerous Variants

The `' OR '1'='1` trick is the gentle version. Here's what gets worse.

### Destructive: DROP TABLE

```
'; DROP TABLE users; --
```

This produces:

```sql
SELECT * FROM users WHERE username = 'alice' AND password = ''; DROP TABLE users; --';
```

That's **two statements**. The first one runs your query (returning nothing). The second
one deletes your entire users table. The `--` is a SQL comment, which swallows the
trailing `'` your code appended. Your database is gone.

### Data theft: UNION-based injection

```
' UNION SELECT credit_card_number, expiry, cvv, null FROM payments --
```

UNION lets the attacker **append rows from a completely different table** to your query
results. If your app displays the query results on a page (like search results), the
attacker can read any table in the database.

### Blind injection

Sometimes the app doesn't display query results directly. The attacker can still extract
data by asking yes/no questions:

```
' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin') = 'a' --
```

If the page loads normally, the first character of the admin's password is `a`. If it
shows an error, it's not. Repeat for every character, every position. It's slow, but
trivially scriptable. Attackers have automated tools (like sqlmap) that do this in seconds.

## A/B Comparison: Vulnerable vs. Safe Code

### A: Vulnerable (Node.js/Express with template literals)

```js
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: user input is pasted directly into the query string
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, row) => {
    if (row) {
      res.send('Login successful');
    } else {
      res.send('Invalid credentials');
    }
  });
});
```

### B: Safe — parameterized queries

```js
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // SAFE: the ? placeholders are filled in by the database driver,
  // which ensures the values are ALWAYS treated as data, never as SQL.
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.get(query, [username, password], (err, row) => {
    if (row) {
      res.send('Login successful');
    } else {
      res.send('Invalid credentials');
    }
  });
});
```

### B (alternative): Safe — using an ORM (Knex.js)

```js
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // SAFE: the ORM builds parameterized queries under the hood
  const user = await knex('users')
    .where({ username, password })
    .first();

  if (user) {
    res.send('Login successful');
  } else {
    res.send('Invalid credentials');
  }
});
```

Notice how little the code changes. The fix is not complicated. You just stop building SQL
from strings.

## Hands-On: Try It Yourself

Here is a complete, runnable example using Node.js and SQLite. You can paste this into a
file and run it.

### Setup: `injection-demo.js`

```js
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

// Create a users table with two users
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'supersecret', 'admin')");
  db.run("INSERT INTO users VALUES (2, 'alice', 'password123', 'user')");
});

function vulnerableLogin(username, password) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('Executing SQL:', query);
    db.all(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function safeLogin(username, password) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    console.log('Executing SQL:', query, '  Params:', [username, password]);
    db.all(query, [username, password], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function demo() {
  console.log('=== VULNERABLE LOGIN ===\n');

  // Normal login
  console.log('--- Normal login attempt ---');
  let result = await vulnerableLogin('alice', 'password123');
  console.log('Result:', result, '\n');

  // SQL injection: bypass authentication
  console.log('--- Injection: bypass login ---');
  result = await vulnerableLogin('alice', "' OR '1'='1");
  console.log('Result:', result, '\n');
  console.log('Returned', result.length, 'users! Attacker sees all accounts.\n');

  console.log('\n=== SAFE LOGIN ===\n');

  // Same injection attempt against parameterized query
  console.log('--- Same injection against safe version ---');
  result = await safeLogin('alice', "' OR '1'='1");
  console.log('Result:', result, '\n');
  console.log('Returned', result.length, 'users. The attack string was treated as a literal password.\n');
}

demo().catch(console.error);
```

### What you'll see when you run it

```
=== VULNERABLE LOGIN ===

--- Normal login attempt ---
Executing SQL: SELECT * FROM users WHERE username = 'alice' AND password = 'password123'
Result: [ { id: 2, username: 'alice', password: 'password123', role: 'user' } ]

--- Injection: bypass login ---
Executing SQL: SELECT * FROM users WHERE username = 'alice' AND password = '' OR '1'='1'
Result: [ { id: 1, username: 'admin', ... }, { id: 2, username: 'alice', ... } ]
Returned 2 users! Attacker sees all accounts.

=== SAFE LOGIN ===

--- Same injection against safe version ---
Executing SQL: SELECT * FROM users WHERE username = ? AND password = ?  Params: [ 'alice', "' OR '1'='1" ]
Result: []
Returned 0 users. The attack string was treated as a literal password.
```

The parameterized query looked for a user whose password is literally the string
`' OR '1'='1`. No such user exists. Attack neutralized.

## Why Parameterized Queries Work

This is the key insight. When you concatenate strings, the database receives one blob of
text and has to **parse** it — figuring out which parts are SQL keywords, which parts are
string literals, which parts are operators. Your SQL and the attacker's SQL are
indistinguishable.

With parameterized queries, the database receives **two separate things**:

```
1. The query STRUCTURE:   SELECT * FROM users WHERE username = ? AND password = ?
2. The DATA values:       ['alice', "' OR '1'='1"]
```

The database compiles the query structure first — it knows there are two string comparison
operations. Then it plugs in the data values. At this point, the data **cannot** alter the
query structure. The quotes and OR keywords in the attacker's input are just characters in
a string, not SQL syntax.

It's the difference between handing someone a Mad Libs template and the words separately
(safe) versus handing them a finished sentence and hoping they can tell which parts were
yours (unsafe).

## Key Takeaway

Never build SQL from strings. Use parameterized queries. Always.

This isn't a best practice or a style preference. It's a hard rule. Any code that
concatenates user input into SQL is vulnerable. It doesn't matter how much you sanitize or
escape the input — you're playing a game you will eventually lose. Parameterized queries
make the entire class of vulnerability structurally impossible.

The reason SQL injection still tops the OWASP list after 25+ years isn't that it's hard to
fix. It's that there's always someone who thinks "I'll just build the string this one
time." Don't be that someone.
