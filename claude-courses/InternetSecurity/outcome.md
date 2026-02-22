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

## Partial / Needs Refinement
- **Disassembly reading**: Exposed to `objdump` output and stack frame layout (sub sp, stp, etc.) but hasn't independently parsed a disassembly yet. Understands the concept (frame size, buffer offset, return address offset) but hasn't practiced it hands-on.

## Gaps — Not Yet Covered
- SQL injection
- Cross-site scripting (XSS)
- Password hashing and storage
- Memory safety bugs
- Patch management and vulnerability lifecycle
- Supply chain / dependency attacks
- Trust boundaries and input validation (meta-concept)

## Lessons Completed
- [x] 01 — The Morris Worm (1988) — quiz passed, exploit exercise completed
- [x] 02 — The PHF CGI Attack (1996) — quiz passed
- [ ] 03 — SQL Injection (2000)
- [ ] 04 — The Samy Worm / XSS (2005)
- [ ] 05 — The RockYou Breach (2009)
- [ ] 06 — Heartbleed (2014)
- [ ] 07 — Equifax & WannaCry (2017)
- [ ] 08 — Log4Shell (2021)
