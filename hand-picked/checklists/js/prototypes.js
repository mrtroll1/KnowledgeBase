// Every object in JS has a hidden link to another object called its [[Prototype]]
// (often shown via __proto__, or fetched with Object.getPrototypeOf(obj)).

// When you access a property on an object and it’s not found, 
// JS walks up the prototype chain to look for it on the prototype, 
// then that object’s prototype, and so on—ending at Object.prototype (then null).

// Inheritance without copying: methods live once on a shared object (the prototype), and all instances reuse them.
// Memory & speed benefits: share behavior instead of duplicating methods per instance.

function Person(name) { this.name = name; } 
Person.prototype.sayHi = function() { return `Hi, I’m ${this.name}`; };

const a = new Person('Ada');
a.sayHi(); // method is found on Person.prototype

// When you do const a = new Person('Ada'), JavaScript sets:
    // a.[[Prototype]] → Person.prototype

// When you call a.sayHi() the engine looks up sayHi on:
    // a itself
    // Person.prototype
    // Object.prototype
    // …not on Person (the constructor function object).

// the following WILL NOT WORK
function Person(name) { this.name = name; } 
Person.sayHi = function() { return `Hi, I’m ${this.name}`; }; // because Person is a contsructor function

// Inheritance works via prototypes
// ES6 Classes are syntactic sugar over prototypes - classes are actually functions
