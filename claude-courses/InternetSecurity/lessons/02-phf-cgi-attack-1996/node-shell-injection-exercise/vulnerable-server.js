const http = require('http');
const { exec } = require('child_process');
const url = require('url');

http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const host = query.host || 'localhost';

  // User input goes directly into a shell command string!
  exec(`ping -c 1 ${host}`, (err, stdout, stderr) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(stdout || stderr);
  });
}).listen(3001, () => console.log('Server on http://localhost:3001'));