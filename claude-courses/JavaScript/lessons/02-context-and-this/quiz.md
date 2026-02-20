# Lesson 2: Context and `this` — Quiz

## Q1

What's the output?

```js
const obj = {
  name: 'outer',
  inner: {
    name: 'inner',
    getName() {
      return this.name;
    }
  }
};

console.log(obj.inner.getName());

const fn = obj.inner.getName;
console.log(fn());
```

---

## Q2

What's the output?

```js
function greet() {
  return `Hello, ${this.name}`;
}

const a = { name: 'Alice' };
const b = { name: 'Bob' };

const greetAlice = greet.bind(a);
console.log(greetAlice());
console.log(greetAlice.call(b));
```

---

## Q3

What's the output and why?

```js
class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  log(message) {
    console.log(`[${this.prefix}] ${message}`);
  }
}

const logger = new Logger('APP');
const logFn = logger.log;

logFn('started');
```

---

## Q4

What's the output?

```js
const team = {
  name: 'Engineering',
  members: ['Alice', 'Bob'],

  listMembers() {
    return this.members.map(function(member) {
      return `${member} is on team ${this.name}`;
    });
  }
};

console.log(team.listMembers());
```

How would you fix it?

---

## Q5

What's the output?

```js
const obj = {
  value: 42,
  getValue: () => this.value,
  getValueRegular() {
    return this.value;
  }
};

console.log(obj.getValue());
console.log(obj.getValueRegular());
```
