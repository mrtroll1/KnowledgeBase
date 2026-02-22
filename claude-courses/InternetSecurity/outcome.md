# Internet Security — Outcome Tracker

## Solid Understanding
- **Buffer overflow mechanics**: Understands the full chain — unbounded `strcpy`/`gets` → overflow past buffer → overwrite saved frame pointer → overwrite return address → CPU jumps to attacker-chosen location. Can trace it byte by byte on the stack diagram.
- **Return address hijacking**: Correctly articulated the real attack: attacker sends executable shellcode as part of the payload, it lands at a predictable address, then the overflow redirects the return address there. This is exactly the Morris Worm technique.
- **Why C is vulnerable**: Understands C's design tradeoff — no bounds checking for performance/control, raw memory with no length metadata. Correctly contrasts with JS/Python (runtime bounds checking) and mentions safe compiler flags as a mitigation.
- **Safe vs unsafe C functions**: Can distinguish `gets` (no size limit, removed in C11) from `fgets` (takes size parameter). Correctly identified the vulnerable version in a code comparison.
- **Modern defenses (conceptual)**: Understands that ASLR+PIE defeats fixed-address exploits (experienced this firsthand when the ARM64 binary was immune), stack canaries detect overwrites, NX prevents stack execution. Knows these are mitigations, not complete fixes.

## Partial / Needs Refinement
- **Disassembly reading**: Exposed to `objdump` output and stack frame layout (sub sp, stp, etc.) but hasn't independently parsed a disassembly yet. Understands the concept (frame size, buffer offset, return address offset) but hasn't practiced it hands-on.

## Gaps — Not Yet Covered
- Command injection
- SQL injection
- Cross-site scripting (XSS)
- Password hashing and storage
- Memory safety bugs
- Patch management and vulnerability lifecycle
- Supply chain / dependency attacks
- Trust boundaries and input validation (meta-concept)

## Lessons Completed
- [x] 01 — The Morris Worm (1988) — quiz passed, exploit exercise completed
- [ ] 02 — The PHF CGI Attack (1996)
- [ ] 03 — SQL Injection (2000)
- [ ] 04 — The Samy Worm / XSS (2005)
- [ ] 05 — The RockYou Breach (2009)
- [ ] 06 — Heartbleed (2014)
- [ ] 07 — Equifax & WannaCry (2017)
- [ ] 08 — Log4Shell (2021)
