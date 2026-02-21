# Lesson 1 Quiz: The Morris Worm — Buffer Overflows

Answer these questions without looking back at the lesson. The goal is to check whether you *understand* the concept, not whether you memorized details.

---

### Question 1: What Actually Happens

A C program declares `char buffer[32]` and then calls `strcpy(buffer, user_input)` where `user_input` comes from the network.

Explain, step by step, what happens in memory if `user_input` is 64 bytes long. Why is this dangerous? What specific data on the stack could be overwritten, and what would that allow an attacker to do?

---

### Question 2: Why C, Specifically?

Why are buffer overflows primarily a problem in C and C++, but not in JavaScript or Python? Be specific — what is it about C's design that makes this possible? And what is the tradeoff: what does C gain by allowing this?

---

### Question 3: Spot the Fix

Here are two versions of a function. One is vulnerable to a buffer overflow; the other is not. Identify which is which, and explain *exactly* what the safe version does differently.

**Version A:**
```c
void log_message(char *msg) {
    char logbuf[256];
    fgets(logbuf, sizeof(logbuf), stdin);
    printf("LOG: %s\n", logbuf);
}
```

**Version B:**
```c
void log_message(char *msg) {
    char logbuf[256];
    gets(logbuf);
    printf("LOG: %s\n", logbuf);
}
```

Bonus: neither version actually uses the `msg` parameter. That is a separate bug, but what kind of issue is it? (This is not a security question — just a code quality observation.)
