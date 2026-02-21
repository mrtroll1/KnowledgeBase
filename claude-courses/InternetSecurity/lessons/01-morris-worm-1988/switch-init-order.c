  #include <stdio.h>

int main() {
      // VERSION A: buffer BELOW authorized → overflow hits it
      int authorized_a = 0;
      char password_a[8];

      // VERSION B: buffer ABOVE authorized → overflow might miss it
      char password_b[8];
      int authorized_b = 0;

      printf("Addresses (version A):\n");
      printf("  authorized_a: %p\n", (void*)&authorized_a);
      printf("  password_a:   %p\n", (void*)password_a);
      printf("  gap: %ld bytes\n\n", (long)((char*)&authorized_a - password_a));

      printf("Addresses (version B):\n");
      printf("  password_b:   %p\n", (void*)password_b);
      printf("  authorized_b: %p\n", (void*)&authorized_b);
      printf("  gap: %ld bytes\n", (long)((char*)&authorized_b - password_b));

      return 0;
  }