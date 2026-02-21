# Lesson 4: The Samy Worm (2005) - Cross-Site Scripting (XSS)

## The Story

On October 4, 2005, a 19-year-old named Samy Kamkar was bored. He'd been poking around
MySpace — the biggest social network in the world at the time — and noticed that you could
add custom HTML and CSS to your profile page. MySpace tried to filter out anything
dangerous, but Samy found the gaps.

He wrote a small piece of JavaScript that did two things when someone viewed his profile:
1. It added Samy as a friend.
2. It pasted the string "but most of all, samy is my hero" onto the visitor's profile.
3. It copied itself onto the visitor's profile, so anyone who viewed *their* page got
   infected too.

That's a worm. Self-replicating code. Within 20 hours, over one million MySpace users had
Samy as a friend and "samy is my hero" on their profiles. It was the fastest-spreading
virus of all time at that point.

Samy later said he expected maybe a few dozen friends. He got a million. And then he got
a visit from the United States Secret Service.

This is the story of cross-site scripting, or XSS — the vulnerability that happens when a
website displays user-supplied content without ensuring it's just text.

## How MySpace Profiles Worked

MySpace's killer feature was customization. Users could add HTML and CSS to their profiles
to change colors, add backgrounds, embed music players. The profile editor was essentially
a rich HTML editor.

MySpace knew this was dangerous. They had filters that stripped out `<script>` tags,
`onclick` attributes, and other obviously dangerous HTML. The filters were applied
server-side: when you saved your profile, MySpace's code scanned the HTML and removed
anything that looked like JavaScript.

The problem: JavaScript can be executed in **many** ways in a browser, and MySpace didn't
block all of them.

## How Samy Did It

Samy needed to get JavaScript to execute inside other users' browsers when they viewed his
profile. Here is how he bypassed each of MySpace's filters, step by step.

### Step 1: No `<script>` tags? Use CSS.

MySpace blocked `<script>` tags. But Internet Explorer (the dominant browser in 2005) had
a CSS feature called `expression()` that could execute JavaScript inside a style
attribute:

```html
<div style="background:url('javascript:alert(1)')">
```

And:

```html
<div style="width: expression(alert(1))">
```

MySpace didn't filter CSS expressions at first. When they started blocking `javascript`,
Samy encoded it:

```html
<div style="background:url('java\nscript:alert(1)')">
```

IE happily ignored the newline inside the string. MySpace's filter didn't recognize it as
the word "javascript" because of the line break.

### Step 2: Blocked keywords? Split them up.

MySpace eventually started blocking keywords like `innerHTML`, `onreadystatechange`, and
other DOM properties. Samy's solution was to build them from string concatenation and use
`eval`:

```js
// Instead of:
document.body.innerHTML = 'something';

// Samy wrote:
eval('document.body.inne' + 'rHTML = "something"');
```

MySpace's filter scanned for the literal string `innerHTML` — it wasn't in the source, so
the filter let it through. At runtime, JavaScript concatenated the strings and executed the
result.

### Step 3: The self-replicating payload

Samy's worm needed to:
1. Read the current user's profile page (to extract their authentication token)
2. Send a friend request to Samy's account
3. Edit the current user's profile to include a copy of the worm code
4. Append "but most of all, samy is my hero" to the profile's hero section

He used `XMLHttpRequest` (the precursor to `fetch`) to make HTTP requests as the logged-in
user. Since the JavaScript was running on `myspace.com`, same-origin policy allowed it to
make requests to MySpace's servers — reading pages, submitting forms, everything.

```
Step 1: GET /profile?id=CURRENT_USER  →  parse the page to find the auth token
Step 2: POST /friends/add             →  send friend request to Samy (using the token)
Step 3: POST /profile/edit            →  paste worm code + hero text into the profile
```

All of this happened invisibly. The user saw Samy's profile page and had no idea any of
this was happening in the background.

## The Propagation Chain

```
                Samy's Profile
                (contains worm code)
                       |
          User A views Samy's profile
          Worm runs in User A's browser
                       |
          +------ Worm actions ------+
          |                          |
   Adds Samy as          Copies worm + "samy is
   A's friend              my hero" to A's profile
                                     |
                          User B views A's profile
                          Worm runs in User B's browser
                                     |
                          +------ Worm actions ------+
                          |                          |
                   Adds Samy as          Copies worm + "samy is
                   B's friend              my hero" to B's profile
                                                     |
                                          User C views B's profile
                                                     |
                                                   (repeat)

  Time: 0 hours ──────────────────────────────> 20 hours
  Infected: 1 ─────────────────────────────────> 1,000,000+
```

Each new infection created a new source of infection. Exponential growth. By the time
MySpace took the site offline to clean up, it was too late.

## The Three Types of XSS

The Samy worm exploited **Stored XSS** — but there are three types, and as a web developer
you should know all of them.

### 1. Stored XSS (a.k.a. Persistent XSS)

The malicious script is **saved on the server** (in a database, a profile field, a comment,
a forum post). Every user who views that content executes the script.

This is what Samy did. The worm code was stored in his MySpace profile. Anyone who loaded
the page ran it.

**Most dangerous type** because it doesn't require tricking a user into clicking a special
link — they just have to visit a page.

### 2. Reflected XSS

The malicious script comes from the **current HTTP request** — usually a URL parameter —
and the server reflects it back in the response without escaping.

Example: a search page that shows "You searched for: `<whatever you typed>`"

```
https://example.com/search?q=<script>alert('XSS')</script>
```

If the server renders the `q` parameter directly into the HTML, the script executes. The
attacker has to trick someone into clicking the malicious URL (via email, chat, etc.).

### 3. DOM-based XSS

The malicious script never touches the server. The client-side JavaScript itself reads
untrusted data (from the URL, from `localStorage`, from `postMessage`) and inserts it into
the DOM unsafely.

Example:
```js
// The page reads the URL hash and inserts it into the page
document.getElementById('greeting').innerHTML = location.hash.slice(1);
```

An attacker sends: `https://example.com/page#<img src=x onerror="alert('XSS')">`

The server returns the same HTML it always does. But the client-side JavaScript reads the
hash and injects the attacker's HTML into the page.

## A/B Comparison: Vulnerable vs. Safe Code

### A: Vulnerable comment system

```js
app.get('/comments', (req, res) => {
  const comments = getCommentsFromDB(); // [{author: '...', text: '...'}, ...]

  let html = '<h1>Comments</h1>';
  for (const comment of comments) {
    // VULNERABLE: comment text is inserted as raw HTML
    html += `<div class="comment">
      <strong>${comment.author}</strong>
      <p>${comment.text}</p>
    </div>`;
  }
  res.send(html);
});
```

If someone posts a comment containing `<img src=x onerror="alert('XSS')">`, that HTML is
rendered directly. The `onerror` fires because the image source `x` doesn't exist, and the
attacker's JavaScript runs in every visitor's browser.

The same problem occurs on the client side:
```js
// VULNERABLE: inserting user content as HTML
commentDiv.innerHTML = userComment;

// React equivalent — the name is a warning on purpose
<div dangerouslySetInnerHTML={{__html: userComment}} />
```

### B: Safe versions

**Server-side: escape output**

```js
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.get('/comments', (req, res) => {
  const comments = getCommentsFromDB();

  let html = '<h1>Comments</h1>';
  for (const comment of comments) {
    // SAFE: all user content is escaped before insertion
    html += `<div class="comment">
      <strong>${escapeHtml(comment.author)}</strong>
      <p>${escapeHtml(comment.text)}</p>
    </div>`;
  }
  res.send(html);
});
```

Now `<img src=x onerror="alert('XSS')">` becomes `&lt;img src=x onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;` — the browser displays it as visible text, not as HTML.

**Client-side: use textContent, not innerHTML**

```js
// SAFE: textContent treats everything as plain text, never as HTML
commentDiv.textContent = userComment;
```

**Content Security Policy (CSP) header — defense in depth**

```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

This HTTP header tells the browser: "Only execute JavaScript that comes from my own
domain. Don't run inline scripts, don't run `eval`, don't load scripts from other
domains." Even if an attacker manages to inject a `<script>` tag, the browser refuses to
execute it.

CSP doesn't replace escaping — it's a safety net for when escaping fails.

## Hands-On: See XSS in Action

Save this as `xss-demo.html` and open it in a browser:

```html
<!DOCTYPE html>
<html>
<head><title>XSS Demo</title></head>
<body>
  <h1>Comment System</h1>

  <h2>Post a comment:</h2>
  <textarea id="input" rows="3" cols="60"
    placeholder="Try: <img src=x onerror=&quot;alert('XSS')&quot;>"></textarea>
  <br>
  <button onclick="postVulnerable()">Post (Vulnerable)</button>
  <button onclick="postSafe()">Post (Safe)</button>

  <h2>Comments (Vulnerable - innerHTML):</h2>
  <div id="vulnerable" style="border: 2px solid red; padding: 10px; min-height: 40px;"></div>

  <h2>Comments (Safe - textContent):</h2>
  <div id="safe" style="border: 2px solid green; padding: 10px; min-height: 40px;"></div>

  <script>
    function postVulnerable() {
      const text = document.getElementById('input').value;
      const div = document.createElement('div');
      div.innerHTML = text;  // VULNERABLE: renders HTML
      document.getElementById('vulnerable').appendChild(div);
    }

    function postSafe() {
      const text = document.getElementById('input').value;
      const div = document.createElement('div');
      div.textContent = text;  // SAFE: treats input as plain text
      document.getElementById('safe').appendChild(div);
    }
  </script>
</body>
</html>
```

### What to try:

1. Type `<b>hello</b>` and click both buttons. The vulnerable version bolds the text. The
   safe version shows the literal HTML tags.

2. Type `<img src=x onerror="alert('XSS')">` and click "Post (Vulnerable)." You'll get an
   alert box — that's JavaScript executing from your "comment." Click "Post (Safe)" — the
   raw text appears harmlessly.

3. Try `<div onmouseover="alert('hover XSS')">Hover over me</div>` in the vulnerable box.
   Move your mouse over the text. JavaScript fires on hover.

Each of these demonstrations is exactly the mechanism behind the Samy worm — just on a
smaller scale.

## Why This Matters Today

You might think: "I use React. It auto-escapes everything. This is a solved problem."

Mostly, yes. React, Vue, Angular, and Svelte all escape output by default. That's a huge
improvement over 2005. But XSS is not dead:

- **`dangerouslySetInnerHTML` in React** — the name is a warning, but developers use it
  anyway, often with content from a CMS or Markdown renderer. If that content includes
  unescaped user input anywhere in its pipeline, you have XSS.
- **`v-html` in Vue** — same problem, friendlier name, easier to misuse.
- **Server-side rendering** — if you build HTML strings on the server and send them to the
  client (like in the examples above), your framework's auto-escaping doesn't help.
- **URL injection** — `<a href={userInput}>` in React is not escaped for `javascript:`
  URLs. If someone sets their "website" field to `javascript:alert('XSS')`, React will
  render a clickable link that executes JavaScript.
- **Third-party libraries** — Rich text editors, Markdown renderers, charting libraries
  often use innerHTML internally. If you pass them unsanitized user content, they may
  inject it.

## Key Takeaway

Never trust user content to be "just text." Always escape output for the context it
appears in.

And those contexts are different:

| Context | What to escape | Example unsafe char |
|---------|---------------|-------------------|
| HTML body | `< > & " '` | `<` becomes `&lt;` |
| HTML attributes | `" ' & < >` | `"` becomes `&quot;` |
| JavaScript strings | `' " \ / newline` | `'` becomes `\'` |
| CSS values | non-alphanumeric | `expression(` is dangerous |
| URLs | anything not URL-safe | `javascript:` scheme |

The Samy worm was possible because MySpace tried to block specific attack patterns
(blocklist approach). They kept finding new patterns to block, and Samy kept finding new
ways around them. The correct approach is to **escape for the output context** or to
**use APIs that do it for you** (textContent, parameterized templates, CSP). Don't try to
enumerate what's dangerous. Assume everything is dangerous and make it safe by default.

That's the same lesson as SQL injection, just in a different context. The pattern is:
**separate code from data.** In SQL, parameterized queries separate the query from the
values. In HTML, escaping (or textContent) ensures user data is never interpreted as markup.
Same principle. Different system.
