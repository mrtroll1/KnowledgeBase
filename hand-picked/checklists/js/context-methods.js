// Js is nuts - the following code is valid
const greet = person.sayHello;   // reuse on someone else
other.sayHello = greet;
other.sayHello(); // should 'this' be person or other?

// Js Core:
    // Functions are free-floating values
    // Objects are just dictionaries. A “method call” is literally “look up a function in a property, then call it.” 
    // There’s no permanent bond between a function and an object.

// Arrow functions
    // 1) Short callbacks
    const nums = [1, 2, 3];
    const doubled = nums.map(n => n * 2);

    // 2) Lexical `this`: perfect in class fields / object methods that need outer this
    class Timer {
    count = 0;
    start() {
        setInterval(() => {          // arrow keeps `this` from start()
        this.count++;
        }, 1000);
    }
    }

// this, call, apply, bind
    // in function we can use 'this' to acess the context. 
    // for exmaple, for instance methods 'this' === instance
    // but we can call, apply and bind to set context explicitly: fn.call(ctx) -> this === ctx

    function greet(g1, g2) {
        console.log(`${g1}, ${this.name}! ${g2}`);
      }
      
    const user = { name: 'Luka' };
    
    greet.call(user, 'Hello', 'Welcome');      // call: args separate
    greet.apply(user, ['Hello', 'Welcome']);   // apply: args as array
    
    const greetLuka = greet.bind(user, 'Hello');
    greetLuka('Welcome');                      // bind: returns new fn
    // all return 'Hello, Luka! Welcome'
      
    class Dropdown {
        constructor(el) {
          this.el = el;
          this.onDocClick = this.onDocClick.bind(this); // bind once
          document.addEventListener('click', this.onDocClick);
        }
        onDocClick(e) {
          if (!this.el.contains(e.target)) this.close();
        }
        close() { this.el.classList.remove('open'); }
      }
    // now onDocClick is a valid callback with access to this. setInterval(onDocClick, 1000) wil work!      
    // if just pass the instance method to setInterval, 'this' will not work
    // .bind gives us a wrapper with a fixed this.
    // alternative
    class Dropdown {
        el;
        onDocClick = (e) => {           // arrow captures instance' 'this'
          if (!this.el.contains(e.target)) this.close();
        };
        constructor(el) {
          this.el = el;
          document.addEventListener('click', this.onDocClick);
        }
        close() { this.el.classList.remove('open'); }
      }
      