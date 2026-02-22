# Lesson 1: The Morris Worm (1988) — Buffer Overflows

## The Hack That Woke Up the Internet

On the evening of November 2, 1988, Robert Tappan Morris — a 23-year-old graduate student at Cornell — released a program into the early internet. His stated goal was to gauge the size of the network. Within hours, it had spiraled out of control.

The worm infected approximately 6,000 machines. That might sound small, but it was roughly **10% of the entire internet** at the time. Systems at MIT, Berkeley, NASA, and military installations ground to a halt. The estimated damage was between $100,000 and $10 million.

Morris became the first person convicted under the **Computer Fraud and Abuse Act of 1986**. He received three years of probation, 400 hours of community service, and a $10,050 fine. He later became a professor at MIT.

But here is the part that matters for us: the Morris Worm was not magic. It exploited a handful of specific, understandable vulnerabilities. The most important one was a **buffer overflow** in `fingerd`, a daemon that let you look up information about users on a remote system.

Let's understand exactly what that means.

---

## What Is a Buffer Overflow?

A buffer overflow is what happens when a program writes more data into a memory region than that region can hold. The extra data spills over into adjacent memory, overwriting whatever was there.

That sounds abstract. Let's make it concrete with C code.

### The Vulnerable Pattern

In C, you allocate arrays with a fixed size. There is no automatic bounds checking:

```c
// VULNERABLE CODE — do not use in production
void greet_user(char *input) {
    char name[16];       // Room for 16 bytes
    strcpy(name, input); // Copies ALL of input into name — no size limit!
    printf("Hello, %s!\n", name);
}
```

If `input` is `"Alice"` (5 characters + null terminator = 6 bytes), this works fine. The 16-byte buffer has plenty of room.

But what if `input` is 100 characters long? `strcpy` does not care. It copies every single byte, writing far past the end of the `name` buffer and into whatever memory comes next.

### The Safe Version

```c
// SAFE CODE — bounds-checked
void greet_user(char *input) {
    char name[16];
    strncpy(name, input, sizeof(name) - 1); // Copy at most 15 bytes
    name[sizeof(name) - 1] = '\0';          // Ensure null termination
    printf("Hello, %s!\n", name);
}
```

The only difference: `strncpy` takes a maximum length. It will never write more than 15 bytes into `name`, no matter how long `input` is. The extra byte is reserved for the null terminator.

---

## Why Does Overwriting Memory Matter?

To understand why this is dangerous, you need to know how the **stack** is laid out when a function is called. Here is a simplified view of what memory looks like inside `greet_user`:

```
         Low Memory Addresses
         +---------------------+
         |   name[0..15]       |  <-- our 16-byte buffer lives here
         |   (local variable)  |
         +---------------------+
         |  Saved Frame Pointer|  <-- bookkeeping: where to restore the
         |  (SFP)              |      stack frame after this function
         +---------------------+
         |  Return Address     |  <-- THE TARGET: where the CPU jumps
         |  (RET)              |      when this function returns
         +---------------------+
         |  (caller's data)    |
         +---------------------+
         High Memory Addresses
```

When `greet_user` finishes, the CPU reads the **return address** off the stack and jumps to that location. Normally, this points back to whatever called `greet_user`.

But if we overflow `name` with enough data, we write past the buffer, past the saved frame pointer, and **directly into the return address**:

```
         +---------------------+
         | AAAAAAAAAAAAAAAA    |  <-- 16 bytes of 'A' fill the buffer
         +---------------------+
         | AAAA                |  <-- 4 more bytes overwrite the SFP
         +---------------------+
         | 0xDEADBEEF          |  <-- 4 more bytes overwrite the return
         |                     |      address with an attacker's value
         +---------------------+
```

Now when the function returns, the CPU jumps to `0xDEADBEEF` — an address the attacker chose. If the attacker placed executable instructions (called **shellcode**) somewhere in memory, the program runs the attacker's code with the program's permissions.

That is the entire trick. There is no lock-picking. There is no secret backdoor. The program was simply given more data than it expected, and it blindly wrote that data into a place that controls execution.

---

## How the Morris Worm Used This

The `fingerd` daemon on BSD Unix listened on port 79. When it received a request, it read the input into a fixed-size buffer using `gets()` — a function that reads input with **no length limit whatsoever**.

```c
// Simplified reconstruction of the vulnerable fingerd code
void handle_request(int socket_fd) {
    char buffer[512];
    gets(buffer);  // Reads from socket — no bounds checking!
    // ... look up the username ...
}
```

The Morris Worm sent a specially crafted 536-byte string to `fingerd`. The first 512 bytes filled the buffer. The remaining bytes overwrote the return address, redirecting execution to a small piece of code (shellcode) embedded in the input itself. That shellcode spawned a shell, which the worm used to download and install itself on the target machine.

---

## Try It Yourself: A Safe Demonstration

Here is a small C program that demonstrates the concept of a buffer overflow without any actual exploitation. It shows how writing past a buffer can overwrite an adjacent variable:

```c
#include <stdio.h>
#include <string.h>

int main() {
    int authorized = 0;
    char password[8];

    printf("Enter password: ");
    gets(password);  // VULNERABLE! No bounds checking.

    if (authorized) {
        printf("Access granted! (authorized = %d)\n", authorized);
    } else if (strcmp(password, "secret") == 0) {
        printf("Correct password!\n");
    } else {
        printf("Wrong password. authorized = %d\n", authorized);
    }
    return 0;
}
```

**To compile and run** (your compiler will warn you about `gets` — that is the point):

```bash
gcc -fno-stack-protector -o overflow demo.c
./overflow
```

The `-fno-stack-protector` flag disables a modern safety feature so you can see the raw behavior.

**What to try:**

1. Type `wrong` and press Enter. You will see: `Wrong password. authorized = 0`
2. Type `secret` and press Enter. You will see: `Correct password!`
3. Type `AAAAAAAAAAAAAAAAAA` (more than 8 characters) and press Enter. You will see: `Access granted! (authorized = some-nonzero-number)`

In case 3, the extra characters spilled past the `password` buffer and into the memory where `authorized` is stored. You never entered the right password, but the program thinks you are authorized — because its memory has been corrupted.

**Note:** The exact behavior depends on your compiler and platform. Some compilers may arrange the variables differently. The `-fno-stack-protector` flag helps reproduce this on modern systems, but if it doesn't work, that itself is a lesson — modern compilers add protections against exactly this class of bug.

---

## "But What If the Variables Were in a Different Order?"

A natural question: the overflow only corrupts `authorized` because it happens to sit right next to `password` in memory. What if the compiler put them in a different order? Wouldn't that "fix" the bug?

### Why Variables Are Adjacent

When you call a function, the CPU does one thing: it moves a single pointer (the **stack pointer**) downward to make room for *all* local variables at once:

```asm
sub rsp, 16    ; reserve 16 bytes — one instruction, done
```

There's no per-variable allocation. No `malloc`. The compiler adds up all local variables, rounds up for alignment, and emits one subtract. That's why the stack is the fastest memory allocation that exists — and why everything is packed together:

```
         HIGH MEMORY
  ┌──────────────────────────┐
  │   return address          │  ← where to go after function ends
  ├──────────────────────────┤
  │   saved frame pointer     │
  ├──────────────────────────┤
  │   authorized (4 bytes)    │  ← packed tight
  ├──────────────────────────┤
  │   password[0..7] (8 bytes)│  ← right next to it
  └──────────────────────────┘
         LOW MEMORY (stack grows DOWN)
```

You can verify this yourself with `switch-init-order.c` in this directory — it prints the actual addresses of variables declared in both orders.

### Reordering Doesn't Save You

Even if reordering the declarations moved `authorized` away from the buffer, the **return address** is *always* above your local variables on the stack. An overflow that keeps going will eventually hit it — no matter what order the variables are in:

```
  ┌──────────────────────────┐
  │   return address ←←←←←←←←│← THIS is what the Morris Worm targeted
  ├──────────────────────────┤
  │   (other locals)          │← overflow trashes these too, but who cares
  ├──────────────────────────┤
  │   password[0..7]          │← start here, keep writing...
  │   AAAAAAAAAAAAAAAAAAAAAAAA│   ...everything above gets overwritten
  └──────────────────────────┘
```

The variable-corruption demo is just a gentle illustration. The *real* danger of buffer overflows is not corrupting a neighbor — it's hijacking the return address, which has a fixed structural position relative to any local buffer.

### Modern Defenses (What Actually Helps)

Since reordering variables doesn't help, real defenses attack the problem differently:

| Defense | What it does |
|---|---|
| **Stack canaries** | Place a secret random value between your locals and the return address. If an overflow overwrites it, the program aborts before returning. |
| **ASLR** | Randomize where the *entire stack* starts in memory each run. The attacker can't predict where their shellcode will land. |
| **Non-executable stack (NX/DEP)** | Mark the stack as data-only. Even if the attacker redirects execution there, the CPU refuses to execute it. |
| **`-fstack-reorder`** | Some compilers *do* reorder variables, placing buffers away from critical data. But this is a mitigation, not a fix — the return address is still reachable. |

### But Do You Even Need the Source Code?

No. Attackers almost never have source code. They find the right overflow offset anyway:

**Disassembly** — The compiled binary *is* the blueprint. One command reveals the stack layout:
```bash
objdump -d ./program | grep -A5 "<main>"
# sub $0x20,%rsp  ← "I reserved 32 bytes" — now you know the offset
```

**Fuzzing** — Send increasingly long inputs until the program crashes, then binary-search for the exact offset. No source code or binary access needed:
```
Send "A" × 100  → OK
Send "A" × 300  → crash!    ← somewhere between 100–300
Send "A" × 200  → OK
Send "A" × 260  → crash!    ← narrowing in...
```

**NOP sleds** — Even when you can't predict the exact jump target, pad your payload with `NOP` instructions (0x90). The return address just needs to land *anywhere* in the sled:
```
┌───────────────────────────────────────┐
│ 90 90 90 90 90 90 90 90 │ shellcode   │
└───────────────────────────────────────┘
  ▲        ▲        ▲
  land here, or here, or here — all work
```

This turns a needle-in-a-haystack into a barn door.

**The uncomfortable truth: imprecision is not a defense.** Every "but you'd need to know..." objection has a well-known countermeasure in the attacker's toolbox. That's why we need real defenses, not security through obscurity.

---

## Exercise 2: Black-Box Fuzzing

In the first exercise, you could read the source code and count bytes. Real attackers don't have that luxury. In this exercise, you'll find the overflow offset the hard way — by probing a program you can't read.

See `blind-overflow/` in this directory for the exercise files and instructions.

---

## The Bigger Picture

### Why Was C Vulnerable?

C gives you raw access to memory. When you declare `char buffer[512]`, the language gives you 512 bytes and trusts you completely. If you write byte 513, C will not stop you. It will not warn you. It will write that byte into whatever happens to be next in memory.

This is not a bug in C — it is a design choice. C was created in 1972 for writing operating systems, where direct memory control is essential. The tradeoff is that the programmer is responsible for all bounds checking.

### How Do Modern Languages Prevent This?

- **JavaScript:** Strings and arrays are managed objects. You cannot write past the end of an array — the runtime prevents it.
- **Python:** Same. `my_list[100]` raises an `IndexError`, it does not silently corrupt memory.
- **Rust:** The compiler enforces memory safety at compile time. Buffer overflows are caught before the program even runs.
- **Java/C#:** Bounds checking is automatic. `ArrayIndexOutOfBoundsException` is annoying but it exists to prevent exactly this.

Buffer overflows still matter in 2026 because enormous amounts of critical infrastructure — operating systems, web servers, databases, embedded systems — are still written in C and C++.

---

## Key Takeaways

1. **A buffer overflow is not mysterious.** It is writing more data than a container can hold, and the excess overwrites adjacent memory.

2. **The attacker did not "break in."** They gave the program exactly what it asked for — input — just more of it than expected. The program broke itself by failing to check the length.

3. **Trust boundaries are everything.** The `fingerd` daemon trusted that network input would fit in a 512-byte buffer. That trust was misplaced. Any data that crosses a boundary (network, file, user input) must be validated.

4. **Never trust input length.** Always use bounded functions: `fgets` instead of `gets`, `strncpy` instead of `strcpy`, `snprintf` instead of `sprintf`. In modern languages, this is handled for you — but understand *why* it is handled for you.

5. **Defenses have improved but the class of bug persists.** Modern systems use stack canaries, ASLR (address space layout randomization), and non-executable stacks. These make exploitation harder — but not impossible. The fundamental fix is writing code that checks its bounds.
