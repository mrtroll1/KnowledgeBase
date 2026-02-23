const http = require('http');
const url = require('url');
const bcrypt = require('bcrypt');

const users = [];

const COST_FACTOR = 12;

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, COST_FACTOR);
    return hash;  
}

async function verifyPassword(password, storedHash) {
    return bcrypt.compare(password, storedHash);
}

const seedUsers = [
    { username: 'admin', password: 'z8k!mQ_secret' },
    { username: 'alice', password: 'iloveyou' },
    { username: 'bob',   password: '123456' },
    { username: 'carol', password: 'princess' },
];

(async () => {
    for (const u of seedUsers) {
        const hash = await hashPassword(u.password);
        users.push({ username: u.username, hash });
    }

    http.createServer(async (req, res) => {
        const parsed = url.parse(req.url, true);
        res.writeHead(200, { 'Content-Type': 'application/json' });

        if (parsed.pathname === '/login') {
            const { username, password } = parsed.query;
            const user = users.find(u => u.username === username);
            if (user && await verifyPassword(password, user.hash)) {
                res.end(JSON.stringify({ success: true, user: user.username }));
            } else {
                res.end(JSON.stringify({ success: false }));
            }

        } else if (parsed.pathname === '/dump-db') {
            res.end(JSON.stringify({
                hash_algorithm: 'bcrypt',
                cost_factor: COST_FACTOR,
                users: users.map(u => ({
                    username: u.username,
                    hash: u.hash
                }))
            }));

        } else {
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }).listen(3005, () => console.log('Safe server (bcrypt) on http://localhost:3005'));
})();
