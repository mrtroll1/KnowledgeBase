#!/bin/bash
#
# Dictionary attack against password hashes
#
# Scenario: the attacker has already breached the database (via SQL injection,
# a backup left on a public server, etc). They now have every user's hash.
#
# This script demonstrates:
#   1. SHA256+salt hashes crack in SECONDS with a small wordlist
#   2. bcrypt hashes are so slow to verify that the same attack is infeasible
#
# The wordlist is the RockYou top 20 — the same passwords that 2009 taught us
# humans love to pick.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_URL="http://localhost:3005"
VULN_SERVER="$SCRIPT_DIR/vulnerable-server.js"
SAFE_SERVER="$SCRIPT_DIR/safe-server.js"

cleanup() {
    [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
}
trap cleanup EXIT

wait_for_server() {
    local attempts=0
    while ! curl -s "$SERVER_URL/dump-db" >/dev/null 2>&1; do
        sleep 0.3
        ((attempts++))
        if [[ $attempts -gt 30 ]]; then
            echo "ERROR: Server did not start within 9 seconds."
            exit 1
        fi
    done
}

# ─────────────────────────────────────────────
echo "============================================="
echo "  Dictionary Attack: SHA256+salt vs bcrypt"
echo "  Same passwords, same wordlist, very"
echo "  different outcomes."
echo "============================================="
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 1: Install dependencies ==="
cd "$SCRIPT_DIR"
if [[ ! -d node_modules ]]; then
    npm install --silent 2>&1 | tail -1
fi
echo "Dependencies ready."
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 2: Start vulnerable server (SHA256 + salt) ==="
node "$VULN_SERVER" &
SERVER_PID=$!
wait_for_server
echo "Server running (PID $SERVER_PID)"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 3: Normal login — verify the server works ==="
echo ""
echo "> GET /login?username=alice&password=iloveyou"
RESP=$(curl -s --get "$SERVER_URL/login" \
    --data-urlencode "username=alice" \
    --data-urlencode "password=iloveyou")
echo "  Response: $RESP"
echo ""
echo "> GET /login?username=alice&password=WRONG"
RESP=$(curl -s --get "$SERVER_URL/login" \
    --data-urlencode "username=alice" \
    --data-urlencode "password=WRONG")
echo "  Response: $RESP"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 4: Steal the database ==="
echo ""
echo "The attacker has breached the DB (SQL injection, leaked backup, etc)."
echo "They now have every hash and salt."
echo ""
echo "> GET /dump-db"
DB_DUMP=$(curl -s "$SERVER_URL/dump-db")
echo "$DB_DUMP" | node -e "
const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('  Algorithm: ' + data.hash_algorithm);
console.log('  Users found: ' + data.users.length);
console.log('');
for (const u of data.users) {
    console.log('  ' + u.username.padEnd(8) + ' salt=' + u.salt.substring(0,12) + '...');
    console.log('           hash=' + u.hash.substring(0,24) + '...');
}
"
echo ""
echo "Notice: the attacker has hashes and salts, but NOT the passwords."
echo "Salts prevent rainbow tables. But can they still crack them?"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 5: Dictionary attack on SHA256+salt ==="
echo ""
echo "Strategy: for each user, try every word in the RockYou top-20 list."
echo "For each guess, compute SHA256(salt + guess) and compare to the stored hash."
echo ""
echo "Cracking..."
echo ""

# The attack runs entirely offline — no server requests needed.
# The attacker has the hashes. They just compute and compare.
SHA_RESULT=$(echo "$DB_DUMP" | node -e "
const crypto = require('crypto');
const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));

// RockYou top 20 wordlist
const wordlist = [
    '123456', '12345', '123456789', 'password', 'iloveyou',
    'princess', 'rockyou', '1234567', '12345678', 'abc123',
    'nicole', 'daniel', 'babygirl', 'monkey', 'jessica',
    'lovely', 'michael', 'ashley', '654321', 'qwerty'
];

const start = Date.now();
let totalGuesses = 0;
const results = [];

for (const user of data.users) {
    let cracked = false;
    for (const guess of wordlist) {
        totalGuesses++;
        const hash = crypto.createHash('sha256')
            .update(user.salt + guess)
            .digest('hex');
        if (hash === user.hash) {
            results.push({ username: user.username, password: guess, guesses: totalGuesses });
            cracked = true;
            break;
        }
    }
    if (!cracked) {
        results.push({ username: user.username, password: null });
    }
}

const elapsed = Date.now() - start;

for (const r of results) {
    if (r.password) {
        console.log('  CRACKED  ' + r.username.padEnd(8) + ' → ' + r.password);
    } else {
        console.log('  SAFE     ' + r.username.padEnd(8) + ' → (not in wordlist)');
    }
}
console.log('');
console.log('  Total guesses: ' + totalGuesses);
console.log('  Time elapsed:  ' + elapsed + 'ms');
console.log('  That is ' + (totalGuesses / Math.max(elapsed, 1) * 1000).toFixed(0) + ' guesses/sec on CPU alone.');
console.log('  A GPU would do billions/sec.');
")

echo "$SHA_RESULT"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 6: Verify cracked passwords actually work ==="
echo ""

# Extract cracked passwords from the result
echo "$SHA_RESULT" | grep "CRACKED" | while read -r line; do
    USERNAME=$(echo "$line" | awk '{print $2}')
    PASSWORD=$(echo "$line" | awk '{print $4}')
    RESP=$(curl -s --get "$SERVER_URL/login" \
        --data-urlencode "username=$USERNAME" \
        --data-urlencode "password=$PASSWORD")
    echo "  Login $USERNAME / $PASSWORD → $RESP"
done
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 7: Switch to safe server (bcrypt) ==="
echo ""
kill "$SERVER_PID" 2>/dev/null
wait "$SERVER_PID" 2>/dev/null
sleep 0.5

node "$SAFE_SERVER" &
SERVER_PID=$!
wait_for_server
echo "Safe server running (PID $SERVER_PID)"
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 8: Steal the bcrypt database ==="
echo ""
echo "> GET /dump-db"
BCRYPT_DUMP=$(curl -s "$SERVER_URL/dump-db")
echo "$BCRYPT_DUMP" | node -e "
const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log('  Algorithm:   ' + data.hash_algorithm);
console.log('  Cost factor: ' + data.cost_factor);
console.log('  Users found: ' + data.users.length);
console.log('');
for (const u of data.users) {
    console.log('  ' + u.username.padEnd(8) + ' hash=' + u.hash.substring(0,32) + '...');
}
"
echo ""
echo "The attacker has the hashes. Same wordlist. Same attack. Let's try."
echo ""

# ─────────────────────────────────────────────
echo "=== Phase 9: Dictionary attack on bcrypt ==="
echo ""
echo "Same strategy, same 20-word list. But now each guess costs ~300ms..."
echo ""
echo "Cracking (this will be slow — that is the point)..."
echo ""

echo "$BCRYPT_DUMP" | node -e "
const bcrypt = require('bcrypt');
const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));

const wordlist = [
    '123456', '12345', '123456789', 'password', 'iloveyou',
    'princess', 'rockyou', '1234567', '12345678', 'abc123',
    'nicole', 'daniel', 'babygirl', 'monkey', 'jessica',
    'lovely', 'michael', 'ashley', '654321', 'qwerty'
];

(async () => {
    const start = Date.now();
    let totalGuesses = 0;

    // Only try the first user to demonstrate the slowness
    const user = data.users[1];  // alice — we know she has a weak password
    console.log('  Targeting user: ' + user.username);
    console.log('  Trying each guess from the RockYou top 20...');
    console.log('');

    for (const guess of wordlist) {
        totalGuesses++;
        const guessStart = Date.now();
        const match = await bcrypt.compare(guess, user.hash);
        const guessTime = Date.now() - guessStart;

        if (match) {
            console.log('    guess ' + String(totalGuesses).padStart(2) + ': \"' + guess + '\"'
                + '  (' + guessTime + 'ms)  ← MATCH FOUND');
            break;
        } else {
            console.log('    guess ' + String(totalGuesses).padStart(2) + ': \"' + guess + '\"'
                + '  (' + guessTime + 'ms)  ✗');
        }
    }

    const elapsed = Date.now() - start;
    console.log('');
    console.log('  Total guesses: ' + totalGuesses);
    console.log('  Time elapsed:  ' + elapsed + 'ms');
    console.log('  Rate: ' + (totalGuesses / elapsed * 1000).toFixed(1) + ' guesses/sec');
    console.log('');
    console.log('  ────────────────────────────────────────');
    console.log('  To try the full RockYou list (14 million words) on ONE user:');
    const timePerGuess = elapsed / totalGuesses;
    const fullListSec = (14000000 * timePerGuess) / 1000;
    const fullListDays = fullListSec / 86400;
    console.log('  ' + (timePerGuess).toFixed(0) + 'ms/guess × 14,000,000 words = '
        + fullListDays.toFixed(0) + ' days');
    console.log('  And that is just ONE user with ONE wordlist.');
    console.log('  A real attack tries billions of combinations = YEARS.');
    console.log('  ────────────────────────────────────────');
})();
" 2>/dev/null

echo ""

# ─────────────────────────────────────────────
echo "============================================="
echo "  Summary"
echo "============================================="
echo ""
echo "  Both servers stored the SAME passwords."
echo "  Both used salts (no rainbow tables possible)."
echo "  The ONLY difference: the hash function."
echo ""
echo "  SHA256+salt:"
echo "    - Dictionary attack cracked 3/4 users instantly"
echo "    - Attacker needs NO server access after the breach"
echo "    - GPUs make this billions of times faster"
echo ""
echo "  bcrypt (cost=12):"
echo "    - Same dictionary attack takes ~300ms PER GUESS"
echo "    - Full RockYou wordlist on ONE user = weeks"
echo "    - Brute force = economically infeasible"
echo ""
echo "  The fix: swap 1 line (sha256 → bcrypt)."
echo "  The protection: factor of ~3,000,000,000x slowdown."
echo "============================================="
