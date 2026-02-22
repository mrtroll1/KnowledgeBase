const http = require('http');
const url = require('url');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(':memory:');

// Set up the database with some users
db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    role TEXT
  )`);
  db.run("INSERT INTO users VALUES (1, 'admin', 'z8k!mQ_secret', 'admin')");
  db.run("INSERT INTO users VALUES (2, 'alice', 'password123', 'user')");
  db.run("INSERT INTO users VALUES (3, 'bob', 'letmein', 'user')");
});

// VULNERABLE: user input pasted directly into SQL string
http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const username = query.username || '';
  const password = query.password || '';

  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(sql, (err, row) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (err) {
      res.end(JSON.stringify({ error: err.message }));
    } else if (row) {
      res.end(JSON.stringify({ success: true, user: row.username, role: row.role }));
    } else {
      res.end(JSON.stringify({ success: false }));
    }
  });
}).listen(3002, () => console.log('Vulnerable server on http://localhost:3002'));
