// let & const - block {} scope, var - function scope
// let & const - can not access before definition, var will return undefined
// const - binding can not be re-assigned (but objects/arrays can still be mutated)

// arrow functions - 'this' and 'arguments' depend on where the function is called (lexical)
// problem
function Timer() {
    this.seconds = 0;
  
    setInterval(function () {
      this.seconds++;
      console.log(this.seconds);
    }.bind(this), 1000); // manually bind 'this'
  }
//solution
function Timer() {
    this.seconds = 0;
  
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }  

// Classes (syntactic sugar over prototypes)
// multiple inheritance through class-returning functions
    const Flyer = Base => class extends Base {
        fly() { return this.name + " flies."; }
    };

    class Animal {
        constructor(name){ this.name = name; }
        speak(){ return this.name + " makes a noise."; }
    }

    class Duck extends Flyer(Animal) {
        speak(){ return this.name + " quacks."; }
    }

// WTF
function tag(strings, ...vals) {
    return strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');
  }
tag(["Hello, ", "!"], x)

// Spread: expand iterables and objects
    const a = [1, 2]; const b = [0, ...a, 3]; // [0, 1, 2, 3]
    const object1 = { name: 'Luka' }, u2 = { ...object1, age: 36 }; // { name: 'Luka', age: 36 }
// Rest: gather the rest
    function sum(first, ...nums) { return nums.reduce((s,n)=>s+n, first); }
    const { id, ...props } = { id: 1, x: 10, y: 20 }; // props = { x: 10, y: 20 }
//Destructuring 
const [first, , third = 0] = [10, 20]; // third = 0

const user = { id: 7, name: 'Luka', skills: { primary: 'JS' } };
const { id: userId, name: fullName, skills: { primary = 'N/A' } } = user;
