# Internet Security: A History of Hacking

A course that teaches internet security through real-world exploits, structured as a timeline from 1988 to 2021. Each lesson is a famous hack that changed the internet — and a hands-on tutorial on the vulnerability behind it.

## Who This Is For

A web developer who knows how HTTP, databases, and servers work — but finds hacking mysterious. By the end, you'll see that every exploit is just someone understanding a system more precisely than its builders did.

## Prerequisites

- Basic understanding of how web servers work (HTTP requests/responses)
- Familiarity with HTML, JavaScript, and SQL syntax
- Comfort reading simple code in any language
- C compiler

## Lessons

1. **The Morris Worm (1988)** — Buffer overflows: how writing past the end of an array can give you control of a computer
2. **The PHF CGI Attack (1996)** — Command injection: when user input reaches the operating system shell
3. **SQL Injection Emerges (2000)** — Sneaking database commands through login forms and search bars
4. **The Samy Worm (2005)** — Cross-site scripting: how a MySpace profile infected a million users in 20 hours
5. **The RockYou Breach (2009)** — Password storage: why 32 million passwords leaked in plain text
6. **Heartbleed (2014)** — Memory safety: reading 64KB of server secrets with a single malformed request
7. **Equifax & WannaCry (2017)** — Unpatched systems: when known vulnerabilities go unfixed at scale
8. **Log4Shell (2021)** — Dependency attacks: how a logging library became a remote backdoor

## How to Use

Open a lesson directory and read `lesson.md`. When you feel ready, try `quiz.md` without looking back. Check yourself against `answers.md`. Discuss anything unclear with Claude.

Each lesson builds a mental model. By lesson 8, you'll be able to look at code and *feel* where the trust boundaries are.
