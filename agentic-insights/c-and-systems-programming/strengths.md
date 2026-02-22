# C and Systems Programming — Strengths

**Source:** KnowledgeBase/InternetSecurity
**Tags:** c, memory-model, security, learning, stack, buffer-overflows

**Asks probing "what if" questions about system internals.** Questioned why stack variables are adjacent rather than randomly placed, which shows genuine systems thinking. Connects cause and effect well — e.g., understanding that buffer overflow only works because of predictable memory layout.

**Traces the full buffer overflow attack chain.** Correctly follows the path from `strcpy` → stack overflow → return address overwrite → arbitrary code execution. Independently articulated that shellcode is sent as data, stored at a predictable address, then the return address is overwritten to point there — this is the Morris Worm technique.

**Understands C's design tradeoffs.** Grasps C's deliberate choice of performance/control over safety and can contrast this with managed languages. Correctly distinguishes safe (`fgets`) from unsafe (`gets`) C functions and understands why the unsafe ones exist and what makes them dangerous.

**Experienced modern defenses firsthand.** Encountered ASLR+PIE when an ARM64 binary defeated the exploit attempt — understands why these modern defenses work (they break the predictable-address assumption the attack relies on).

**Interested in C and wants to build familiarity with it.** Actively engaging with low-level concepts through a security lens, which is a strong path into systems programming.
