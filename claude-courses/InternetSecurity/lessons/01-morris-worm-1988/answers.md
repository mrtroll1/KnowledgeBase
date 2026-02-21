# Lesson 1 Answers: The Morris Worm — Buffer Overflows

---

### Answer 1: What Actually Happens

When `strcpy(buffer, user_input)` is called with 64 bytes of input but only 32 bytes of buffer space:

1. `strcpy` begins copying bytes from `user_input` into `buffer`, starting at `buffer[0]`.
2. It copies all 32 bytes that fit in the buffer. So far, no problem.
3. It keeps going. Bytes 33 through 64 are written into memory *past the end of the buffer*. `strcpy` has no concept of the buffer's size — it copies until it finds a null byte in the source.
4. On the stack, the memory just past `buffer` contains the **saved frame pointer** (which tracks the caller's stack frame) and the **return address** (which tells the CPU where to jump when this function finishes).
5. The overflow overwrites the return address with attacker-controlled data.
6. When the function returns, the CPU jumps to whatever address now sits in the return address slot.

**Why this is dangerous:** If the attacker carefully crafts those 64 bytes, they can set the return address to point to code they have placed in memory (shellcode). The program then executes the attacker's code with whatever permissions the program had. If the program runs as root, the attacker gets root access.

The key insight: the attacker never "hacked" anything in the Hollywood sense. They provided input. The program did the rest by trusting that input would fit.

---

### Answer 2: Why C, Specifically?

Buffer overflows are primarily a C/C++ problem because of two design decisions:

1. **No automatic bounds checking.** When you write `buffer[40]` on a 32-element array, C does not check whether 40 is within bounds. It calculates the memory address and reads/writes there, whatever "there" happens to be. There is no runtime check, no exception, no error.

2. **Raw memory access.** Arrays in C are just pointers to contiguous blocks of memory. There is no metadata stored alongside the array that tracks its length. Functions like `strcpy` have no way to know how big the destination buffer is — that information simply does not exist at runtime.

**The tradeoff:** C gains *performance and control*. Bounds checking on every array access costs CPU cycles. For an operating system kernel or an embedded system that must run in microseconds, that overhead matters. C trusts the programmer to get it right, and in return, the code runs as fast as the hardware allows.

**Modern languages prevent this differently:**
- **JavaScript and Python** manage memory through a runtime. Arrays/strings are objects with known lengths. The runtime checks every access and raises an error if you go out of bounds.
- **Rust** enforces memory safety at compile time. The compiler proves at build time that your code cannot overflow a buffer. If it cannot prove this, it refuses to compile. You get C-like performance without the danger.
- **Java/C#** use a managed runtime with bounds checking, similar to Python/JS but with better performance through JIT compilation.

---

### Answer 3: Spot the Fix

**Version B is vulnerable. Version A is safe.**

The critical difference is the function used to read input:

- **Version B** uses `gets(logbuf)`. The `gets` function reads input until it encounters a newline or EOF. It has **no parameter for buffer size**. If the input is 1,000 bytes and the buffer is 256 bytes, `gets` will happily write all 1,000 bytes, overflowing the buffer. The function `gets` is so dangerous that it was **removed entirely from the C standard** in C11. It is impossible to use `gets` safely.

- **Version A** uses `fgets(logbuf, sizeof(logbuf), stdin)`. The second argument — `sizeof(logbuf)` — tells `fgets` the maximum number of bytes to read. It will read at most 255 bytes (reserving one byte for the null terminator) and stop, regardless of how much input is available. The buffer can never overflow.

That is the entire fix. Same buffer, same goal, but one function respects the boundary and the other does not.

**Bonus:** The unused `msg` parameter is a code quality issue — likely a bug where the programmer intended to log the `msg` argument but accidentally read from `stdin` instead. In terms of classification, it could be called dead code or an unused parameter warning. Most compilers will flag it with `-Wall`. It is not a security issue on its own, but sloppy code and security bugs tend to travel together.
