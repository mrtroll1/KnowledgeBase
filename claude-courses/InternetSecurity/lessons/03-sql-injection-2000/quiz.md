# Lesson 3 Quiz: SQL Injection

Answer these without looking back at the lesson. Write out your reasoning.

---

## Question 1: Craft an Injection

A search feature runs this query:

```js
const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`;
```

Write an input for `searchTerm` that would return **every row** in the `products` table,
regardless of their name.

---

## Question 2: Spot the Vulnerability

Which of these two code snippets is vulnerable to SQL injection? Explain why.

**Snippet A:**
```python
cursor.execute(
    "SELECT * FROM orders WHERE customer_id = %s AND status = %s",
    (customer_id, status)
)
```

**Snippet B:**
```python
cursor.execute(
    f"SELECT * FROM orders WHERE customer_id = {customer_id} AND status = '{status}'"
)
```

---

## Question 3: ORMs Aren't Magic

A developer says: "I use Sequelize (an ORM), so I'm safe from SQL injection." Is this
always true? Describe a situation where using an ORM could still leave you vulnerable.

---

## Question 4: Blind SQL Injection

You're testing a login page. When you enter a valid username with a wrong password, you
see "Invalid password." When you enter a nonexistent username, you see "User not found."

The login query is vulnerable to SQL injection. You can't see the query results directly,
but you can see which error message you get.

Explain how you could use this difference in error messages to extract the admin user's
password, one character at a time. What SQL would you inject?
