# Lesson 2: The PHF CGI Attack (1996) — Command Injection

## A Phonebook That Gave Away the Keys

In the mid-1990s, the web was new and CGI scripts were how you made it do things. CGI — Common Gateway Interface — was simple: the web server received a request, ran an external program, and sent the program's output back as HTML.

One of the CGI scripts that shipped with NCSA httpd (the ancestor of Apache) was called **PHF** — a phonebook lookup tool. You typed a name, it searched a local directory, and it showed you the result. Completely mundane.

Then someone discovered that by putting `%0a` in the URL — a URL-encoded newline character — they could make the server execute **arbitrary commands**.

A request like this:

```
http://target.com/cgi-bin/phf?Qalias=x%0a/bin/cat%20/etc/passwd
```

Would return the contents of `/etc/passwd` — the system's user database. Not because of some elaborate hack. Because the PHF script passed the user's input directly to a shell, and a newline character told the shell: "that was one command, here's another."

This was one of the **first widely-exploited web vulnerabilities**. It was trivially easy. You could do it from a browser's address bar. Automated scanners began roaming the early web, testing every server they could find for this one URL.

---

## The Mechanism: How Input Reaches the Shell

To understand why this works, you need to see the data flow. Here is what happens when a normal request hits a CGI script:

```
  +----------+     HTTP Request      +------------+
  | Browser  | -------------------> | Web Server  |
  +----------+                      +------------+
       User types:                        |
       "Qalias=Alice"                     | Runs CGI script
                                          v
                                   +------------+
                                   | PHF Script |
                                   | (Perl/C)   |
                                   +------------+
                                          |
                                          | Passes input to shell:
                                          | /usr/local/bin/ph "Alice"
                                          v
                                   +------------+
                                   |   Shell    |
                                   |  (/bin/sh) |
                                   +------------+
                                          |
                                          | Executes command
                                          v
                                   +------------+
                                   |     OS     |
                                   +------------+
```

The **trust boundary violation** is between the PHF script and the shell. The script assumes the input is a name. The shell interprets it as a command string — and in a command string, a newline starts a new command.

Now here is what happens with the attacker's input:

```
  +----------+     HTTP Request      +------------+
  | Attacker | -------------------> | Web Server  |
  +----------+                      +------------+
       Sends:                             |
       "Qalias=x%0a/bin/cat /etc/passwd"  |
                                          v
                                   +------------+
                                   | PHF Script |
                                   +------------+
                                          |
                                          | Passes to shell:
                                          | /usr/local/bin/ph "x
                                          | /bin/cat /etc/passwd"
                                          v
                                   +------------+         The shell sees TWO
                                   |   Shell    |  <---   commands separated
                                   +------------+         by a newline!
                                          |
                               +----------+----------+
                               v                     v
                        /usr/local/bin/ph "x"   /bin/cat /etc/passwd
                        (fails, who cares)      (returns user list!)
```

The `%0a` is decoded to a newline (`\n`). The shell treats everything after the newline as a second, independent command. The attacker's command runs with the permissions of the web server process.

---

## The Pattern: Shell Injection

The PHF bug is an instance of **command injection** (also called shell injection). The pattern is always the same:

1. Your program receives input from an untrusted source (URL, form field, API parameter).
2. Your program constructs a shell command as a string, embedding that input.
3. Your program passes the string to a shell for execution.
4. The attacker's input contains shell metacharacters (newlines, semicolons, pipes, backticks) that alter the command's meaning.

This is not ancient history. This exact pattern exists in modern codebases whenever someone uses string concatenation to build a command.

---

## A/B Comparison: Vulnerable vs. Safe

### Vulnerable: String Concatenation with exec()

Here is a Node.js HTTP server that lets users ping a host. It is 15 lines and completely compromised:

```js
// VULNERABLE — do not use this pattern
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
}).listen(3000, () => console.log('Server on http://localhost:3000'));
```

A normal request looks like:
```
http://localhost:3000/?host=google.com
```

An attack looks like:
```
http://localhost:3000/?host=google.com;cat%20/etc/passwd
```

The shell receives: `ping -c 1 google.com; cat /etc/passwd`

The semicolon is a command separator, just like the newline was in the PHF attack. The shell runs the ping, then runs `cat /etc/passwd`, and the server sends both outputs back to the attacker.

Other dangerous characters the attacker could use:
- `;` — command separator
- `|` — pipe output to another command
- `` ` `` — execute enclosed text as a command (backticks)
- `$()` — command substitution
- `\n` — newline (like the original PHF attack)
- `&&` — run next command if first succeeds

### Safe: Parameterized Execution with execFile()

```js
// SAFE — arguments are passed as an array, not through a shell
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
}).listen(3000, () => console.log('Server on http://localhost:3000'));
```

The difference is fundamental:
- **`exec()`** passes the entire string to `/bin/sh -c "..."`. The shell interprets every metacharacter.
- **`execFile()`** calls the program directly and passes each argument separately. There is no shell. A semicolon in `host` is just a literal semicolon in the argument — `ping` will try to ping a host named `google.com;cat /etc/passwd`, fail, and that is the end of it. No second command is executed.

Even better, add input validation:

```js
// SAFEST — validate input AND use parameterized execution
const HOSTNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

if (!HOSTNAME_REGEX.test(host)) {
  res.writeHead(400, { 'Content-Type': 'text/plain' });
  res.end('Invalid hostname');
  return;
}

execFile('ping', ['-c', '1', host], (err, stdout, stderr) => {
  // ...
});
```

Now the input is validated against an allowlist of safe characters *before* it is used anywhere. Defense in depth: even if `execFile` had a bug, the regex would catch the attack.

---

## Try It Yourself

Save the vulnerable version as `server.js` and run it:

```bash
node server.js
```

In another terminal, try these requests:

```bash
# Normal use
curl "http://localhost:3000/?host=localhost"

# Command injection — read a file
curl "http://localhost:3000/?host=localhost;cat%20/etc/passwd"

# Command injection — list files
curl "http://localhost:3000/?host=localhost;ls%20-la%20/"

# Command injection using backticks
curl "http://localhost:3000/?host=\`whoami\`"
```

Now replace the `exec` call with `execFile` (the safe version) and try the same attacks. You will see them fail — the injected commands are treated as literal arguments to `ping`, not as shell commands.

---

## Connecting This to Your World

If you are a web developer, ask yourself: have you ever written code like this?

```js
// "I need to convert an image, let me just call ImageMagick"
exec(`convert ${uploadedFile} -resize 200x200 ${outputPath}`);
```

```python
# "I need to check if a domain resolves"
os.system(f"dig {user_domain}")
```

```js
// "I need to run a git command with the user's branch name"
exec(`git checkout ${branchName}`);
```

Every one of these is vulnerable to command injection. If `uploadedFile` is `photo.jpg; rm -rf /`, your server just deleted itself.

The pattern is always the same: **user input + string concatenation + shell execution = command injection**.

---

## The Broader Principle: Parameterized APIs

Command injection belongs to a family of **injection vulnerabilities** that all share the same root cause: mixing code and data in a single string.

| Vulnerability       | What gets mixed                     | The fix                        |
|---------------------|--------------------------------------|-------------------------------|
| Command injection   | Shell commands + user input          | `execFile()` with args array  |
| SQL injection       | SQL code + user input                | Parameterized queries         |
| XSS                 | HTML/JS + user input                 | Context-aware output encoding |

In every case, the fix is the same idea: **keep code and data in separate channels**. Parameterized APIs do this by design — they pass data as data, never allowing it to be interpreted as code.

You will see SQL injection and XSS in the next lessons. They are the same concept in different costumes.

---

## Key Takeaways

1. **Never pass user input to a shell.** Use parameterized APIs like `execFile()` (Node.js), `subprocess.run()` with a list (Python), or `ProcessBuilder` (Java). If you must use a shell, validate and sanitize input against a strict allowlist.

2. **Understand the data flow.** Draw it out: where does the input enter? What systems does it pass through? At each boundary, ask: "Can the input change the *meaning* of what happens here?" If yes, you have an injection point.

3. **`exec()` vs `execFile()` is not a trivia question.** It is the difference between "user data is interpreted by a shell" and "user data is passed as a literal argument." The first is almost always wrong.

4. **The PHF attack was trivially easy.** The attacker did not need to reverse-engineer anything or write exploit code. They typed a URL in a browser. The simplest attacks are often the most devastating because they scale — anyone can do them, automated tools can do them millions of times.

5. **Injection vulnerabilities are a family.** Once you understand command injection, you understand the principle behind SQL injection, XSS, and LDAP injection. They are all "untrusted input changes the meaning of a structured string."
