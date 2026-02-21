# Lesson 7 Answers: Equifax & WannaCry — Unpatched Systems

---

### Answer 1: The Timeline Gap

The "danger zone" is the period between when a patch becomes available for a vulnerability and when an organization actually applies it. During this window, three things are simultaneously true:

1. The vulnerability is publicly known (because the CVE and patch have been published).
2. Attackers know exactly what to exploit (they can reverse-engineer the patch to understand the vulnerability).
3. The organization's systems are still vulnerable (because the patch has not been applied).

This is the worst possible state: maximum attacker knowledge, zero defender protection.

The gap exists in large organizations for several interconnected reasons:

- **Risk aversion about breaking production.** Patches change code. Changed code can break things. Without thorough automated testing, applying a patch is a gamble. Many teams would rather accept the theoretical risk of a breach than the concrete risk of downtime.
- **Diffuse ownership.** In a large org, the security team identifies the CVE, the ops team manages the servers, and the dev team owns the application. Without clear ownership of patching, the responsibility falls into the cracks between teams.
- **Legacy systems.** Applications built years ago by people who have since left, with no tests and no documentation, are terrifying to update. But they are also the most likely to be running outdated dependencies.
- **Scale.** An organization may have hundreds or thousands of servers. Patching one is easy. Coordinating patches across an entire fleet, testing each one, and rolling them out without downtime is a major operational challenge.

The Equifax gap was 68 days. The WannaCry gap was 59 days. Both were plenty of time to patch.

---

### Answer 2: Zero-Day vs. N-Day

A **zero-day vulnerability** is one that is unknown to the vendor and has no patch available. The name comes from the fact that the vendor has had "zero days" to fix it. Attackers who discover a zero-day can exploit it with no defense possible other than generic security measures.

An **n-day vulnerability** is one that has been disclosed and patched, but the patch has not been applied everywhere. The "n" represents the number of days since the patch was released. An n-day exploit targets the gap between patch availability and patch application.

Both WannaCry and Equifax used **n-day vulnerabilities**. The Struts vulnerability (CVE-2017-5638) had a patch available on the same day it was disclosed. The Windows SMB vulnerability exploited by EternalBlue (MS17-010) was patched a month before the exploit was even leaked publicly.

**N-day vulnerabilities are responsible for far more real-world breaches than zero-days.** Zero-days are rare, expensive (they can sell for millions on the black market), and typically reserved for high-value, targeted attacks by nation-states. Most attackers do not need zero-days because there are plenty of organizations running unpatched software. Why spend millions on a zero-day when you can scan the internet for systems missing a two-month-old patch?

---

### Answer 3: Automated Patching

The "install once, never update" approach is dangerous because:

1. **New vulnerabilities are discovered constantly** in existing packages. A dependency that was safe when you installed it may have critical CVEs discovered months or years later.
2. **You are responsible for your transitive dependencies too.** Even if you only use 10 packages directly, those packages depend on other packages. A vulnerability in any of them affects your application.
3. **Attackers actively scan for known vulnerable versions.** If your `package-lock.json` pins a version with a known CVE, automated tools will find and exploit it.

Tools and practices that address this:

1. **`npm audit`** (or `pip audit`, `mvn dependency-check:check`): Checks your installed dependencies against a database of known vulnerabilities. Can be run locally or in CI. Adding `npm audit --audit-level=critical` as a CI step means the build fails if any critical vulnerabilities are present, preventing deployment of known-vulnerable code.

2. **GitHub Dependabot** (or Snyk, Renovate): Continuously monitors your dependency files for known vulnerabilities. When a CVE is published that affects one of your dependencies, it automatically opens a pull request updating the affected package to a patched version. This eliminates the "nobody remembered to check" problem.

3. **Automated dependency update PRs on a schedule**: Tools like Renovate can be configured to open PRs for all dependency updates (not just security ones) on a weekly or monthly cadence. This keeps dependencies fresh and reduces the chance that a critical security update will require a massive, risky version jump.

4. **Lockfile auditing in CI**: Ensuring that `package-lock.json` (or equivalent) is committed and that CI validates it prevents situations where different environments run different dependency versions.

---

### Answer 4: Defense in Depth

Defense in depth means that no single security failure should lead to total compromise. Even with the Struts vulnerability unpatched, these measures could have limited the damage:

1. **Network segmentation.** The web server running Apache Struts should not have had direct access to the database containing 147 million Social Security numbers. Segmenting the network into zones — with the web-facing application in a DMZ and the sensitive database in an isolated internal network — would have required the attacker to breach multiple layers. Even if they compromised the web server, they would have been contained.

2. **Encryption of sensitive data at rest.** The Social Security numbers and other PII should have been encrypted in the database. Even if attackers accessed the database, they would have obtained encrypted blobs rather than plaintext personal information. The encryption keys should be stored in a separate key management system, not on the same server.

3. **Monitoring and anomaly detection.** Attackers were inside Equifax's network for 76 days before being discovered. Intrusion detection systems (IDS), log monitoring, and anomaly detection could have flagged unusual patterns — like a web server making unexpected database queries, or large volumes of data being exfiltrated. A properly monitored system would have caught the breach much sooner, limiting the amount of data exposed.

4. **Principle of least privilege.** The web application likely ran with far more database permissions than it needed. If the Struts application only had read access to the specific data required for its function (rather than access to 147 million records), the blast radius would have been dramatically smaller.

5. **Web Application Firewall (WAF).** A WAF sitting in front of the Struts application could have detected and blocked the exploit payload in the `Content-Type` header. Known attack patterns, including OGNL injection, can be filtered by WAF rules. This is not a substitute for patching, but it buys time.

Any one of these measures would have reduced the severity of the breach. Together, they could have made the difference between a minor incident and one of the worst data breaches in history.
