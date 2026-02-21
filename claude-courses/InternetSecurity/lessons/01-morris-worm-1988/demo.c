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