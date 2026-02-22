// victim.c — A vulnerable program for the blind fuzzing exercise.
//
// STUDENT: Do not read this file until you've completed the exercise!
// The point is to find the vulnerability without knowing the source.
//
// Compile:  gcc -fno-stack-protector -no-pie -z execstack -o victim victim.c
// (these flags disable modern protections so you can learn the fundamentals)

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void secret_function() {
    printf("\n========================================\n");
    printf("  YOU HIJACKED THE RETURN ADDRESS!\n");
    printf("  This function was never called by main.\n");
    printf("  An attacker would put shellcode here.\n");
    printf("========================================\n");
    exit(0);
}

void check_input() {
    char buffer[64];
    printf("Enter the access code: ");
    fflush(stdout);
    gets(buffer);  // VULNERABLE — no bounds checking

    if (strcmp(buffer, "opensesame") == 0) {
        printf("Access granted.\n");
    } else {
        printf("Access denied.\n");
    }
}

int main() {
    printf("=== Secure(tm) Access Terminal v1.0 ===\n");
    printf("(Hint: you don't need the password)\n\n");
    check_input();
    printf("Goodbye.\n");
    return 0;
}
