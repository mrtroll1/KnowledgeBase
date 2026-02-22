const http = require('http');
const { execFile } = require('child_process');
const url = require('url');

http.createServer((req, res) => {
  const query = url.parse(req.url, true).query;
  const host = query.host || 'localhost';

  // execFile passes arguments directly to the program — no shell involved
  execFile('ping', ['-c', '1', host], (err, stdout, stderr) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(stdout || stderr);
  });
}).listen(3001, () => console.log('Server on http://localhost:3001'));