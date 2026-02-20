<h3>In JavaScript, functions can be freely passed around like regular variables.</h3>
For example, the following is valid js!

```js
class Person {
    constructor(greeting) {
        this.greeting = greeting;
    }
    sayHi() {
        return `Hi! ${this.greeting}`;
    }
}
class Animal {
    constructor(greeting) {
        this.greeting = greeting;
    }
}
const greet = Person.prototype.sayHi;
const animal = new Animal('wow-wow-wow');
animal.sayHi = greet;
animal.sayHi()
```

This is because a method call is purely virtual - there is no strong bond between a function and an object.
animal.greet() will use anial as 'this', so 'this' will be re-asigned - depends on how function is called, not where it is defined.
But if we do want to stick a function to some exact 'this', we can use .bind. 
For example, 

```js
const person = new Person('hello');
const bound = p.sayHi.bind(person);

bound();              
const callLater = bound;
callLater();          
```

Bind return a new function with 'this' permanently set to person.
If we only want animal to borrow the method once, we can do

```js
Person.prototype.sayHi.call(animal);   
Person.prototype.sayHi.apply(animal); 
```

As opposed to regular functions, 'this' for arrow functions is inherited from the context where they are defined and freezed.
So if we intend to use an instance method as a callback, we can do so by using an arrow function (but better use .bind)

```js
class EventHandler {
    constructor(event) {
        this.event = event;
    }
    handleEvent = () => {
        console.log(`${this.event} handled`);
    }
}

const handler = new EventHandler('click');
element.addEventListener('click', handler.handleEvent);
```

<h3>In JavaScript, there are no classes. Classes are functions. Functions are callable objects.</h3>

Every object in js has a prototype. 
For classes (constructible functions), .prototype is an object to put the definitions of 'instance methods' in.
For objects, [[Prototype]] or Object.getPrototypeOf(obj) will return .prototype of its constructor function.
Prototypes are also used for inheritance chains to not duplicate methods. 
For example,

```js
function Person(name) {this.name = name; }
Person.prototype.sayHi = function() { return `Hi, I’m ${this.name}`; };

const obj = new Person('Ada');
obj.sayHi();
```

Here, js will look for sayHi method on obj - not found. Let's check Object.getPrototypeOf(obj) (=== Person.prototype) - found!
Inheritance works through prototypes. 

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function () {
  return `${this.name} eats.`;
};

function Mammal(name) {
  Animal.call(this, name); 
}
Mammal.prototype = Object.create(Animal.prototype); 
Mammal.prototype.constructor = Mammal;       // otherwise Mammal.prototype.constructor === Animal     
Mammal.prototype.walk = function () {
  return `${this.name} walks.`;
};

const mammal = new Mammal('Luka');

mammal.walk(); 
mammal.eat();  

Object.getPrototypeOf(mammal) === Mammal.prototype;                 
Object.getPrototypeOf(Mammal.prototype) === Animal.prototype;  
Object.getPrototypeOf(Animal.prototype) === Object.prototype; 
Object.getPrototypeOf(Object.prototype) === null;
```

ES6 (since 2015) has classes - syntactical sugar over this prototypes bs.
The word for inheritance is 'extends' - class Mammal extends Animal {}
