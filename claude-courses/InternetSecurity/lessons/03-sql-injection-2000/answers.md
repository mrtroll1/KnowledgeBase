# Lesson 3 Quiz: Answers

## Question 1: Craft an Injection

**Input:** `%' OR '1'='1' --`

**How it works:**

The original query template is:
```sql
SELECT * FROM products WHERE name LIKE '%${searchTerm}%'
```

After substitution, the SQL becomes:
```sql
SELECT * FROM products WHERE name LIKE '%%' OR '1'='1' --%'
```

Breaking this down:
- `%` completes the LIKE pattern (matches everything, but that's not the point)
- `'` closes the string literal that your code opened
- `OR '1'='1'` adds a condition that is always true
- `--` comments out the trailing `%'` that your code would have appended

Since `'1'='1'` is always true, the WHERE clause is true for every row. All products are
returned.

**Alternative that also works:** `' OR 1=1 --`

This produces `LIKE '%' OR 1=1 --%'`. The `LIKE '%'` already matches everything, and
`OR 1=1` makes it true regardless. Either way, full table dump.

---

## Question 2: Spot the Vulnerability

**Snippet B is vulnerable.** Snippet A is safe.

**Snippet A** uses parameterized queries. The `%s` placeholders are filled in by the
database driver, which sends the query structure and the data separately to the database.
The values in the tuple `(customer_id, status)` are always treated as data, never as SQL
syntax. This is the correct approach.

**Snippet B** uses an f-string (Python's template literal) to paste `customer_id` and
`status` directly into the SQL string. If `status` contains `'; DROP TABLE orders; --`,
the database will execute that as SQL. This is classic string concatenation injection.

Note the subtle trap: both snippets use `%s` or `{}` as placeholders, but they work
completely differently. In Snippet A, `%s` is a **database driver placeholder** — the
driver handles escaping and separation. In Snippet B, `{customer_id}` is a **Python
f-string substitution** — it just pastes the value into the string before the database
ever sees it.

---

## Question 3: ORMs Aren't Magic

**No, using an ORM does not automatically make you safe.**

ORMs are safe when you use their query-building API, because they generate parameterized
queries internally. But most ORMs also provide a way to execute raw SQL, and that raw SQL
is just as vulnerable as any other string concatenation.

**Example with Sequelize:**

```js
// SAFE: using the ORM's API
const users = await User.findAll({
  where: { username: userInput }
});

// VULNERABLE: raw query with string concatenation
const users = await sequelize.query(
  `SELECT * FROM users WHERE username = '${userInput}'`
);
```

Other situations where ORMs can still be vulnerable:
- Using `.literal()` or `.raw()` methods with unsanitized input
- Building dynamic column names or table names from user input (most ORMs don't
  parameterize identifiers, only values)
- Using `ORDER BY` with user-supplied column names — the ORM might not parameterize
  these since they're identifiers, not values
- Some ORMs have had bugs where certain operators or edge cases bypassed parameterization

The rule is the same regardless of whether you use an ORM: **never let user input become
part of the SQL structure.** The ORM's standard API enforces this; its escape hatches
don't.

---

## Question 4: Blind SQL Injection

This is a **boolean-based blind injection**. The two different error messages ("Invalid
password" vs. "User not found") give us a yes/no oracle.

**The approach:** Inject SQL into the username field that asks a true/false question about
the admin's password. If the question is true, the database finds the admin user (and
we get "Invalid password"). If false, the database finds no user (and we get "User not
found").

**The injected username:**

```
admin' AND SUBSTRING(password, 1, 1) = 'a' --
```

This produces:

```sql
SELECT * FROM users WHERE username = 'admin' AND SUBSTRING(password, 1, 1) = 'a' AND password = '...'
```

Wait — the `--` comments out the password check, so it's actually:

```sql
SELECT * FROM users WHERE username = 'admin' AND SUBSTRING(password, 1, 1) = 'a' --' AND password = '...'
```

- If the first character of admin's password **is** `a`: the query returns the admin row,
  and the app says "Invalid password" (user found, wrong password).
- If the first character **is not** `a`: the query returns nothing, and the app says
  "User not found" (no matching row).

**To extract the full password:**

1. Test character 1: try `a`, `b`, `c`, ..., `z`, `0`-`9`, symbols. When you get
   "Invalid password" instead of "User not found," you've found the character.
2. Move to character 2: `admin' AND SUBSTRING(password, 2, 1) = 'a' --`
3. Repeat until you've got the full password.

**Optimization:** Use binary search with comparisons instead of equality:
```
admin' AND ASCII(SUBSTRING(password, 1, 1)) > 109 --
```
This cuts the search space in half each time (like binary search). For a character set of
~95 printable ASCII characters, you need about 7 queries per character instead of up to 95.

**In practice:** Tools like sqlmap fully automate this process and can extract an entire
database through blind injection in minutes.
