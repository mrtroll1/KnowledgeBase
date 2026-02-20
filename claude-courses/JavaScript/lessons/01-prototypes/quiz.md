# Lesson 1: Prototypes — Quiz

## Q1

What's the output?

```js
function Dog(name) {
  this.name = name;
}

Dog.prototype.speak = function() {
  return `${this.name} says woof`;
};

const d1 = new Dog('Rex');
const d2 = new Dog('Buddy');

console.log(d1.speak === d2.speak);
console.log(d1.hasOwnProperty('speak'));
console.log(d1.hasOwnProperty('name'));
```

---

## Q2

What's wrong with this code? It doesn't throw an error, but it has a subtle bug.

```js
function Car(make) {
  this.make = make;
}

Car.prototype.describe = function() {
  return `This is a ${this.make}`;
};

const c = Car('Toyota');
console.log(c.describe());
```

---

## Q3

What's the output and why?

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a noise`;
  }
}

class Cat extends Animal {
  speak() {
    return `${this.name} meows`;
  }
}

const cat = new Cat('Whiskers');
console.log(cat.speak());
console.log(Object.getPrototypeOf(Object.getPrototypeOf(cat)).speak.call(cat));
```

---

## Q4

What's the output?

```js
const obj = { a: 1 };
console.log(Object.getPrototypeOf(Object.getPrototypeOf(obj)));
```

---

## Q5

What's the output and why?

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const p = new Person('Alice');

Person.prototype = {
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

const p2 = new Person('Bob');

console.log(p.greet());
console.log(p2.greet());
```
