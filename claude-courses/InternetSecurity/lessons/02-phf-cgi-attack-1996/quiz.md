# Lesson 2 Quiz: The PHF CGI Attack — Command Injection

Answer these without looking back at the lesson.

---

### Question 1: Spot the Injection

Here is a Python Flask endpoint that lets users check whether a file exists on the server:

```python
import os
from flask import Flask, request

app = Flask(__name__)

@app.route('/check')
def check_file():
    filename = request.args.get('name', '')
    result = os.popen(f'ls -la /uploads/{filename}').read()
    return f'<pre>{result}</pre>'
```

1. Construct a URL that would make this server reveal the contents of `/etc/shadow`.
2. Explain exactly why your attack works — what does the shell see?
3. Rewrite the function to be safe against command injection.

---

### Question 2: exec() vs execFile()

In Node.js, explain the fundamental difference between `child_process.exec()` and `child_process.execFile()`. Specifically:

1. What does `exec()` do with the command string before running it?
2. Why does `execFile()` prevent injection even if the argument contains shell metacharacters like `;`, `|`, or backticks?
3. Is there any scenario where `execFile()` could still be dangerous? (Think carefully.)

---

### Question 3: The Principle Underneath

The PHF attack (command injection), SQL injection, and cross-site scripting are all classified as "injection vulnerabilities."

1. What do they have in common at a structural level? What is the shared root cause?
2. What is the shared principle behind the fix for all of them?
3. A colleague argues: "We sanitize all input by removing semicolons and newlines, so we're safe from command injection." Why is this approach fragile? Name at least two reasons.
