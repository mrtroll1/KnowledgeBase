# Lesson 2 Answers: The PHF CGI Attack — Command Injection

---

### Answer 1: Spot the Injection

**1. The attack URL:**

```
http://target.com/check?name=x;cat%20/etc/shadow
```

Or using a pipe:
```
http://target.com/check?name=x|cat%20/etc/shadow
```

**2. Why it works:**

The `os.popen()` call constructs a shell command by inserting the user's input directly into the string:

```
ls -la /uploads/x;cat /etc/shadow
```

The shell interprets the semicolon as a command separator. It runs two commands:
- `ls -la /uploads/x` — probably fails (no such file), but that does not matter
- `cat /etc/shadow` — reads the shadow password file and sends its output back through `os.popen()`

The result of both commands is returned in the HTTP response.

**3. The safe version:**

```python
import subprocess
import re
from flask import Flask, request

app = Flask(__name__)

SAFE_FILENAME = re.compile(r'^[a-zA-Z0-9._-]+$')

@app.route('/check')
def check_file():
    filename = request.args.get('name', '')

    # Validate: only allow safe filename characters
    if not SAFE_FILENAME.match(filename):
        return 'Invalid filename', 400

    # Use subprocess.run with a list — no shell involved
    result = subprocess.run(
        ['ls', '-la', f'/uploads/{filename}'],
        capture_output=True, text=True
    )
    return f'<pre>{result.stdout}</pre>'
```

Two layers of defense:
- **Input validation** with an allowlist regex rejects any filename containing `;`, `|`, spaces, or other dangerous characters.
- **`subprocess.run()` with a list** bypasses the shell entirely. Even if validation were missing, the semicolon in `x;cat /etc/shadow` would be passed as a literal argument to `ls`, which would look for a file literally named `x;cat /etc/shadow` in the `/uploads/` directory.

Even better: do not shell out at all. Use `os.path.exists()` and `os.stat()` to check files directly in Python. The safest shell command is the one you never run.

---

### Answer 2: exec() vs execFile()

**1. What exec() does:**

`exec()` takes the command string and passes it to `/bin/sh -c "..."` (on Unix) or `cmd.exe /c "..."` (on Windows). A full shell process is spawned, and the shell interprets the entire string — including all metacharacters like `;`, `|`, `&&`, backticks, `$()`, redirections (`>`, `<`), and wildcards (`*`, `?`).

So `exec('ping -c 1 ' + userInput)` becomes `sh -c "ping -c 1 <whatever the user typed>"`. The shell parses the whole thing as a command line.

**2. Why execFile() is safe:**

`execFile()` does not invoke a shell. It calls the specified program directly using the operating system's `execve()` system call (or equivalent). The arguments array is passed directly to the program as its `argv[]`.

When you write `execFile('ping', ['-c', '1', userInput])`, the OS runs the `ping` binary and hands it three arguments. If `userInput` is `localhost;cat /etc/passwd`, then `ping` receives the literal string `localhost;cat /etc/passwd` as its third argument. It tries to resolve that as a hostname, fails, and reports an error. The semicolon is never interpreted as a command separator because there is no shell to interpret it.

**3. Can execFile() still be dangerous?**

Yes, in a few scenarios:

- **If the executable itself is a shell.** `execFile('/bin/sh', ['-c', userInput])` is just as dangerous as `exec()` because you are explicitly invoking a shell.
- **If the executable interprets its arguments dangerously.** For example, `execFile('find', [userInput, '-exec', ...])` — the `find` command's `-exec` flag can run arbitrary programs. The danger is in `find`'s behavior, not the shell.
- **If the program path itself comes from user input.** `execFile(userInput, [])` lets the attacker choose which program to run.
- **On Windows,** `execFile` may still spawn `cmd.exe` for `.bat` or `.cmd` files, reintroducing shell interpretation.

The principle: `execFile` eliminates *shell* injection, but the executed program can still be misused if you do not control its arguments carefully.

---

### Answer 3: The Principle Underneath

**1. What they have in common:**

All injection vulnerabilities share the same structural flaw: **code and data are mixed in a single channel**, and the receiving system cannot tell which parts are instructions and which parts are data.

- Command injection: shell commands and user input are concatenated into one string. The shell parses the whole thing.
- SQL injection: SQL code and user input are concatenated into one string. The database engine parses the whole thing.
- XSS: HTML/JavaScript and user input are concatenated into one string. The browser parses the whole thing.

In each case, the attacker crafts input that, once embedded in the string, is interpreted as code rather than data.

**2. The shared fix:**

**Parameterization** — keep code and data in separate channels so the interpreter never has to guess which is which.

- For shells: `execFile()` with an arguments array. The program is in one channel, the arguments are in another.
- For SQL: parameterized queries / prepared statements. The SQL template is in one channel (`SELECT * FROM users WHERE id = ?`), the value is in another (bound separately).
- For HTML: context-aware output encoding. The HTML structure is in one channel, the user data is escaped so the browser treats it as text, not markup.

The principle is always: **the interpreter should never have to parse untrusted input as code.**

**3. Why removing semicolons and newlines is fragile:**

This approach — called a **denylist** or **blocklist** — is unreliable for several reasons:

1. **There are too many dangerous characters.** Semicolons and newlines are just two of many shell metacharacters. The attacker could use `|` (pipe), `&&`, `||`, backticks, `$()`, `>` (redirect to overwrite files), or even less obvious characters like `\0` (null byte) or unicode variants. You have to block *every* dangerous character, and you will miss one.

2. **Encoding bypasses.** The attacker might use different encodings: double URL encoding (`%250a`), unicode characters that normalize to dangerous ASCII characters, or encoding tricks specific to the shell or OS. Your denylist checks the input in one representation, but the shell may decode it differently.

3. **Context sensitivity.** What is "dangerous" depends on where the input is used. A semicolon is dangerous in a shell command but harmless in a SQL query (where `'` is the danger). A denylist designed for one context breaks when the input is used in another.

4. **Maintenance burden.** Every new shell feature, every new metacharacter, every encoding trick requires updating the denylist. It is a constant arms race. An allowlist (only permit known-safe characters) or parameterization (eliminate interpretation entirely) solves the problem once and permanently.

The correct approach is always: **use a parameterized API, and if you must validate, use an allowlist** (only permit characters you know are safe) rather than a denylist (block characters you know are dangerous).
