# Lesson 7: Equifax & WannaCry (2017) — Unpatched Systems

## The Year That Proved Patching Is Not Optional

2017 gave us two of the most devastating cybersecurity incidents in history. They targeted different systems, affected different victims, and were carried out by different attackers. But they shared the same root cause: **known vulnerabilities with available patches that nobody applied.**

This lesson is not about clever hacking. It is about organizational failure — and why the gap between "a patch exists" and "a patch is applied" is the most dangerous window in cybersecurity.

---

## WannaCry (May 2017)

### The NSA's Secret Weapon Gets Leaked

The story starts with the NSA. The National Security Agency discovered a critical vulnerability in Windows' **SMB (Server Message Block)** protocol — the service Windows uses for file sharing across networks. Rather than report it to Microsoft, the NSA kept it secret and built an exploit called **EternalBlue** to use as a cyberweapon.

Then things went sideways.

A hacking group called **The Shadow Brokers** obtained the NSA's toolkit and, in April 2017, leaked it publicly. EternalBlue was now available to anyone with an internet connection.

Here is the critical timeline:

- **March 14, 2017:** Microsoft releases patch MS17-010 fixing the SMB vulnerability
- **April 14, 2017:** Shadow Brokers leak EternalBlue publicly
- **May 12, 2017:** WannaCry ransomware begins spreading worldwide

Read that again. Microsoft patched the vulnerability **one month before** the exploit was even leaked. Every system that was up to date was already protected. WannaCry only hit machines that had not applied a two-month-old patch.

### How WannaCry Spread

WannaCry was ransomware with a twist — it was also a **worm**. Like the Morris Worm from Lesson 1, it spread automatically without human interaction.

```
┌──────────────────────────────────────────────────────────────┐
│                    WannaCry Attack Flow                       │
│                                                              │
│   Infected Machine                     Target Machine        │
│   ┌─────────────┐    SMB (port 445)    ┌─────────────┐      │
│   │  WannaCry   │ ──────────────────>  │  Windows     │      │
│   │  worm       │    EternalBlue       │  (unpatched) │      │
│   │  component  │    exploit           │              │      │
│   └─────────────┘                      └──────┬──────┘      │
│                                               │              │
│                                               v              │
│                                        ┌─────────────┐      │
│                                        │ Encrypts all │      │
│                                        │ files, shows │      │
│                                        │ ransom note  │      │
│                                        │ ($300 BTC)   │      │
│                                        └─────────────┘      │
│                                               │              │
│                                               v              │
│                                        Scans network for     │
│                                        more targets on       │
│                                        port 445...           │
└──────────────────────────────────────────────────────────────┘
```

Once inside a network, WannaCry scanned for other machines with open SMB ports and exploited them automatically. It hit **200,000+ computers in 150 countries** in a matter of hours.

The UK's National Health Service (NHS) was devastated. Hospitals could not access patient records. Ambulances were diverted. Surgeries were cancelled. People's lives were put at risk — not by a sophisticated attack, but by a failure to apply a patch.

### The Accidental Kill Switch

Here is one of the most remarkable details in cybersecurity history. A 22-year-old security researcher named **Marcus Hutchins** (known online as MalwareTech) was analyzing WannaCry's code and noticed something odd: before encrypting files, the malware tried to connect to a specific unregistered domain name.

```
iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com
```

If the domain resolved (i.e., someone had registered it), the malware would stop. This was likely an anti-analysis technique — sandbox environments often resolve all domains, so the check was meant to detect if the malware was being studied.

Hutchins registered the domain for $10.69. WannaCry infections worldwide stopped spreading immediately. He had accidentally triggered the kill switch.

---

## Equifax (July-September 2017)

### The Breach That Exposed Half of America

Equifax is one of the three major credit bureaus in the United States. They hold the most sensitive financial data imaginable: Social Security numbers, birth dates, addresses, driver's license numbers, credit histories.

In September 2017, Equifax disclosed that attackers had been inside their systems since **mid-May** and had accessed the personal data of **147 million people** — roughly half the US adult population.

The vulnerability? **CVE-2017-5638**, a remote code execution flaw in **Apache Struts**, an open-source Java web framework that Equifax used for their web application.

### The Timeline

```
         Equifax Breach Timeline
         ========================

  Mar 6  ──── CVE-2017-5638 disclosed. Patch available SAME DAY.
    │
    │         ┌──────────────────────────────────────────┐
    │         │                                          │
    │         │   THE DANGER ZONE                        │
    │         │   Patch exists. Equifax has not applied   │
    │         │   it. Attackers have the exploit.         │
    │         │                                          │
  May 13 ──── │── Attackers begin exploiting Equifax     │
    │         │                                          │
    │         │   Attackers move laterally through the   │
    │         │   network. Access 147M records.          │
    │         │                                          │
  Jul 29 ──── │── Equifax discovers the breach           │
    │         │                                          │
    │         └──────────────────────────────────────────┘
    │
  Sep 7  ──── Equifax publicly discloses the breach
    │
    v
         Total time from patch to breach: ~68 days
         Total time attackers were inside: ~76 days
```

Sixty-eight days. A patch was available for 68 days before the attackers got in. They then roamed the network for 76 more days before anyone noticed.

### The Struts Exploit Mechanism

This is where it gets interesting for you as a web developer. Remember command injection from Lesson 2? This is the same idea, but through a different vector.

Apache Struts uses a technology called **OGNL (Object-Graph Navigation Language)** — an expression language that can evaluate code. The vulnerability was in how Struts parsed the `Content-Type` header.

When a request came in with an invalid `Content-Type`, Struts would generate an error message. The problem: it evaluated the `Content-Type` value as an OGNL expression *before* generating the error. If you put code in the `Content-Type` header, Struts would execute it.

```
Normal request:
  POST /action HTTP/1.1
  Content-Type: application/x-www-form-urlencoded

  name=alice&age=30


Malicious request:
  POST /action HTTP/1.1
  Content-Type: ${(#cmd='id').(#iswin=(@java.lang.Runtime@getRuntime().exec(#cmd)))}

  (body doesn't matter)
```

Simplified, the malicious `Content-Type` header contained an OGNL expression that called `Runtime.exec()` — Java's equivalent of a shell command. The server executed it with whatever permissions the web application had.

This is command injection (Lesson 2), but instead of entering `; rm -rf /` into a web form, the attacker put executable code into an HTTP header that nobody expected to contain code. The trust boundary violation is the same: **user-controlled data was treated as code.**

```
┌──────────────────────────────────────────────────────────┐
│                 How CVE-2017-5638 Works                   │
│                                                          │
│   Attacker                          Struts Server        │
│   ┌──────────┐                      ┌──────────────┐    │
│   │ Sends    │  Content-Type:       │ Parses       │    │
│   │ crafted  │  ${OGNL_expression}  │ Content-Type │    │
│   │ request  │ ──────────────────>  │              │    │
│   └──────────┘                      └──────┬───────┘    │
│                                            │             │
│                              Invalid type? │             │
│                              Generate error│             │
│                                            v             │
│                                     ┌──────────────┐    │
│                                     │ Evaluates    │    │
│                                     │ Content-Type │    │
│                                     │ as OGNL      │    │
│                                     │ expression   │    │
│                                     └──────┬───────┘    │
│                                            │             │
│                                            v             │
│                                     ┌──────────────┐    │
│                                     │ Runtime.exec │    │
│                                     │ runs shell   │    │
│                                     │ command      │    │
│                                     └──────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Why Don't Organizations Patch?

This is the question. If the fix was available, why didn't they apply it?

The uncomfortable truth: patching in a large organization is hard. Not technically hard — *organizationally* hard.

1. **Fear of breaking things.** A patch to Apache Struts could change behavior that the application depends on. Without comprehensive test coverage, nobody wants to be the person who "broke production" by applying an update.

2. **Nobody owns the responsibility.** The security team knows about the CVE. The ops team manages the servers. The dev team owns the application. Who is responsible for patching Struts? In many organizations, the answer is "unclear," which means "nobody."

3. **Legacy systems with no test coverage.** If the application was built years ago by a team that no longer exists, and there are no automated tests, updating a dependency feels like defusing a bomb while blindfolded.

4. **"It won't happen to us."** The most dangerous belief in security. There are millions of servers on the internet. Surely attackers will not find ours? (They will. Automated scanners find every publicly exposed vulnerable system within hours of an exploit being published.)

---

## A/B Comparison: Patch Management

### Scenario A — The Equifax Way (Bad)

```
Developer writes app using Apache Struts 2.3.x
    │
    v
App is deployed to production
    │
    v
Months pass. No one checks for dependency updates.
    │
    v
CVE-2017-5638 is published. Security team sends an email.
    │
    v
Email sits in someone's inbox.
    │
    v
68 days later: breach.
```

No automated dependency updates. No vulnerability scanning. No patch management policy. The gap between "patch available" and "patch applied" is left entirely to human initiative and organizational communication.

### Scenario B — Defense in Depth (Good)

```
Developer writes app. Dependencies are tracked in a lockfile.
    │
    v
CI/CD pipeline includes automated vulnerability scanning:
  - npm audit / pip audit / mvn dependency-check
  - Dependabot or Snyk monitors for new CVEs
  - Build FAILS on critical vulnerabilities
    │
    v
CVE is published. Automated alert goes to the team within hours.
Dependabot opens a pull request with the fix.
    │
    v
Team reviews and deploys the patched version.
    │
    v
Meanwhile, defense in depth provides additional layers:
  - WAF (Web Application Firewall) blocks known exploit patterns
  - Network segmentation limits blast radius
  - Database encryption protects data at rest
  - Monitoring detects unusual access patterns
```

---

## Hands-On: Checking Your Own Dependencies

### Using npm audit

If you have a Node.js project, run:

```bash
npm audit
```

This checks every dependency (including transitive ones) against a database of known vulnerabilities. The output will look something like:

```
┌───────────────┬──────────────────────────────────────────────────┐
│ Critical      │ Prototype Pollution in lodash                    │
├───────────────┼──────────────────────────────────────────────────┤
│ Package       │ lodash                                           │
├───────────────┼──────────────────────────────────────────────────┤
│ Patched in    │ >=4.17.21                                        │
├───────────────┼──────────────────────────────────────────────────┤
│ Dependency of │ my-framework                                     │
├───────────────┼──────────────────────────────────────────────────┤
│ Path          │ my-framework > old-lib > lodash                  │
└───────────────┴──────────────────────────────────────────────────┘
```

To automatically fix what can be fixed:

```bash
npm audit fix
```

### Adding Vulnerability Scanning to CI

Here is a simple GitHub Actions step that fails the build if critical vulnerabilities are found:

```yaml
# In your .github/workflows/ci.yml
- name: Check for vulnerabilities
  run: npm audit --audit-level=critical
```

If any dependency has a critical CVE, the build fails. This means no one can merge code that introduces (or ignores) a critical vulnerability.

### GitHub Dependabot

If you use GitHub, enable Dependabot in your repository settings. It will:

1. Monitor your dependency files (`package.json`, `requirements.txt`, `pom.xml`, etc.)
2. Check for known vulnerabilities daily
3. Automatically open pull requests to update vulnerable dependencies

This is the single easiest thing you can do to avoid being the next Equifax. It takes about two minutes to enable and runs forever.

---

## Key Takeaways

1. **Most breaches don't use zero-days.** They use vulnerabilities that have had patches available for weeks or months. Equifax was breached through a vulnerability with a 68-day-old patch. WannaCry exploited a vulnerability with a 59-day-old patch. Attackers do not need to be clever when defenders are slow.

2. **The danger zone is the gap between "patch available" and "patch applied."** Shrinking that gap is one of the highest-value security investments an organization can make.

3. **Security is as much about process as about code.** You can write perfectly secure code and still be breached because a dependency you did not write has a vulnerability you did not patch.

4. **Defense in depth means no single failure is catastrophic.** Equifax's Struts vulnerability should not have given attackers access to 147 million unencrypted Social Security numbers. There should have been network segmentation, database encryption, access monitoring, and egress filtering. Any one of those layers could have limited the damage.

5. **Automate everything you can.** Humans forget. Emails get ignored. Automated scanning in CI/CD catches what humans miss. Make the secure path the default path.
