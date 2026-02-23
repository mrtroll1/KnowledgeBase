const http = require('http');
const url = require('url');
const crypto = require('crypto');

const users = [];

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256')
        .update(salt + password)
        .digest('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
    const hash = crypto.createHash('sha256')
        .update(salt + password)
        .digest('hex');
    return hash === storedHash;
}

const seedUsers = [
    { username: 'admin', password: 'z8k!mQ_secret' },
    { username: 'alice', password: 'iloveyou' },
    { username: 'bob',   password: '123456' },
    { username: 'carol', password: 'princess' },
];

for (const u of seedUsers) {
    const { salt, hash } = hashPassword(u.password);
    users.push({ username: u.username, salt, hash });
}

http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (parsed.pathname === '/login') {
        const { username, password } = parsed.query;
        const user = users.find(u => u.username === username);
        if (user && verifyPassword(password, user.salt, user.hash)) {
            res.end(JSON.stringify({ success: true, user: user.username }));
        } else {
            res.end(JSON.stringify({ success: false }));
        }

    } else if (parsed.pathname === '/dump-db') {
        res.end(JSON.stringify({
            hash_algorithm: 'sha256',
            users: users.map(u => ({
                username: u.username,
                salt: u.salt,
                hash: u.hash
            }))
        }));

    } else {
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}).listen(3005, () => console.log('Vulnerable server (SHA256+salt) on http://localhost:3005'));
