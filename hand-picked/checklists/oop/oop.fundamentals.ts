// There are classes. Classes have fields and methods specific to instances and static fields and methods.

interface Shape {
    draw();
    calculatePerimeter();
}

// Static field / method
class Circle implements Shape{
    public static PI_VALUE = 3.14;
    private radius: number;

    constructor (radius: number) {
        this.radius = radius;
    }

    public static getPerimeterFormula(): string {
        return '2 * pi * radius';
    }

    public calculatePerimeter(): number {
        return 2 * this.radius * Circle.PI_VALUE;
    }

    public draw(): void {
        console.log(`${Circle.name}`)
    }
}

// Encapsulation, access modifiers, getters and setters
    // We need encapsulation for easier mental mapping and responsibility distribution.
    // public (for everyone to use), protected (for itself and children to use), private (only for itself to use)
    // getters and setters - depend on behaviour, not data or implementation. 

// Inheritance, abstract classes
    // Inheritance - 'is-a' relationship
    class Drivable {
        protected x: number
        protected y: number
        protected speed: number

        constructor (x: number, y: number, speed: number) {
            this.x = x;
            this.y = y;
            this.speed = speed;
        }

        public steer(xShift: number, yShift: number) {
            this.x += xShift;
            this.y += yShift;
        }
    }

    class Car extends Drivable {
        public doCoolCarShit() {
            this.x = 1 / this.x;
            this.y = 1 / this.y;
            this.speed = this.speed * this.speed;
        }
    }

    // Abstract class - new is forbidden. Usually contains implemented common behaviour and interface to implement.
    // Drivable should probably be abstract. 
    abstract class AbstractDrivable {
        protected x: number
        protected y: number
        protected speed: number; 

        constructor (x: number, y: number, speed: number) {
            this.x = x;
            this.y = y;
            this.speed = speed;
        }

        public steer(xShift: number, yShift: number) {
            if (this.validateSafety()) {
                this.x += xShift;
                this.y += yShift;
            }
        }

        protected abstract validateSafety(): boolean;
    }

    class NewCar extends AbstractDrivable {
        constructor(x: number, y: number, speed: number) { super(x, y, speed); }

        protected override validateSafety(): boolean {
            if (this.speed * (this.x + this.y) > 100) {
                return false
            } else {
                return true
            }
        }

        public doCoolCarShit() {
        if (this.validateSafety()) {
            this.x = 1 / this.x;
            this.y = 1 / this.y;
            this.speed = this.speed * this.speed;
        }
        }
    }

// Association, Aggregation, Composition
    // all of the above - 'has-a' relationship
    // Association: class A uses class B but does not own it, B is purelly functional
        // register.use-case has this.notifier and calls this.notifier.notify()

    // Aggregation: class A uses class B and holds objects of type B but does not own it, B is meaningful on its own.
        // register.use-case holds a list of validators. a validator can be aggregated by many use-cases.

    // Composition: class A uses class B and holds oobjects of type B and owns them, B does not exist outisde of A.
        // register.use-case is the only place where we do: new PassowrdVerifier() (a rather weird example)

// Inheritance vs Composition
    // +: Code reuse, Shared contracts, Centralized fixes/features
    // -: Tight coupling, Overriding hazards, Multiple inheritance is hard 

    // +: Loose coupling, Flexible behaviour at runtime, Multiple composition is easy
    // -: More wiring, Discoverability, Interfaces should be small and clean

    // When to use inheritance: 
        // Clear abstraction that fits many implementations
        // use-cases that inherit the execute() from the base and only change some implementations of protected methods.
    
    // When to use composition:
        // Assemble different behaviour together
        // use-cases that are initialized with other use-cases, because they need them (these use-cases could be different at run-time)

// Interface - a contract that has to be fulfilled. 
    // Subtype polymorphism: Shape - Circle, Square
    // Functional polymorpthism: add<N, N> (a: N, b: N): N { return a + b } - can be overloaded with different types

// Multiple inheritance 
    class NiceShape {
        protected area: number;

        constructor (area: number) {
            this.area = area;
        }

        public shrink(): void {
            this.area = this.area / 2;
        }
    }

    class NiceColorable {
        protected color: number;

        constructor (color: number) {
            this.color = color;
        }

        public reStyle(): void {
            this.color = 1 / this.color;
        }
    }

    class NiceSquare extends NiceShape, NiceColorable {
        // 
    }

    // We could do
    const square = new NiceSquare(1, 2);
    square.shrink();
    square.reStyle();

    // Diamond inheritance problem in a nutshell 
    interface A { }
    interface B extends A { y: number }
    interface C extends A { z: number }
    interface D extends B, C {} // OK

    interface B2 extends A { x: number }   
    interface C2 extends A { x: string }   
    interface D2 extends B2, C2 {}  // Incompatible
    // Ways of resolving this depend on the language

// Inheritance through inherfaces
    interface CoolShape {
        area: number;
        shrink(): void;
    }

    interface CoolColorable {
        color: number;
        reStyle(): void;
    }

    class CoolSquare implements CoolShape, CoolColorable {
        public area: number;
        public color: number;

        constructor (area: number, color: number) {
            this.area = area;
            this.color = color;
        }

        public shrink(): void {
            this.area = this.area / 2;
        }

        public reStyle(): void {
            this.color = 1 / this.color;
        }
    }

    // Composition + delegation (my example with Rectangle delegating to internally initialized Alggebraic and Colored Rectangles)

// Increase cohesion: SRP
// Reduce coupling: DIP