// Objects and Data Structures - Chapters 6 and 10 from Robert Martin's Clean Code

// Object vs Data Structure
    // Data Structures - procedural approach
    const PI_VALUE = 3.1415926

    interface ShapeDTO {}

    class SquareDTO implements ShapeDTO{
        public sideLength: number;
        public bottomLeftPoint: number[];
    }

    class CircleDTO implements ShapeDTO {
        public radius: number;
        public originPoint: number[];
    }

    function calculatePerimeter(shape: ShapeDTO): number {
        if (shape instanceof SquareDTO) {
            return shape.sideLength * 4;
        } else if (shape instanceof CircleDTO) {
            return shape.radius * 2 * PI_VALUE
        } else { 
            return 0 
        }
    }
    // When working with data structures like these shape-dto's, we can add new methods without having to change 
        // the shapes or any of the code that depends on the shapes. 
        // But if we want to add a new shape, we have to change all the things that depend on shapes.
    
    // Objects - OOP approach
    interface Shape {
        calculatePerimeter(): number;
    }
      
    class Circle implements Shape {
        static readonly PI_VALUE = 3.1415926;
        
        constructor(public radius: number, public originPoint: number) {}
        
        calculatePerimeter(): number {
            return 2 * Circle.PI_VALUE * this.radius;
        }
    }
      
    class Square implements Shape {
        constructor(public sideLength: number, public originPoint: number) {}
        
        calculatePerimeter(): number {
            return 4 * this.sideLength;
        }
    }
    // When working with objects like these shapes, we can add new shapes without having to change
        // the methods or any of the code that depends on the shapes.
        // But if we want to add a new method, we have to change all the shapes. 

// Class organization
class XXXSkyRocket {
    // 1. Static constants
    public static readonly GRAVITATIONAL_CONSTANT: number = 9.81; // m/s^2
  
    // 2. Static fields
    private static rocketCount: number = 0;
  
    // 3. Instance fields
    private name: string;
    private mass: number; // in kg
    private fuel: number; // in liters
  
    // 4. Constructor
    constructor(name: string, mass: number, fuel: number) {
      this.name = name;
      this.mass = mass;
      this.fuel = fuel;
      XXXSkyRocket.rocketCount++;
    }
  
    // 5. Public methods
    public launch(): void {
      if (this.fuel <= 0) {
        console.log(`${this.name} cannot launch. No fuel left!`);
        return;
      }
  
      this.consumeFuel();
      console.log(`${this.name} is launching!`);
    }
  
    public getFuelLevel(): number {
      return this.fuel;
    }
  
    public static getRocketCount(): number {
      return XXXSkyRocket.rocketCount;
    }
  
    // 6. Protected methods
    protected calculateThrust(): number {
      return this.fuel * 0.5 - this.mass * XXXSkyRocket.GRAVITATIONAL_CONSTANT;
    }
  
    // 7. Private helper methods
    private consumeFuel(): void {
      this.fuel -= 10; 
    }
}
  
// Encapsulation
    // a. We put data and methods that operate upon it together
    // b. We restrict access to class internals: getters & setters, protecteds and privates

// Classes should be compact
    // Small and SRP

// SRP
    // Single responsibility = single reason to change

// Cohesion
    // Classes should have a small number of instance variables, each instance method should ideally use all of them

// Cohesion -> many small classes
    // When classes lose cohesion, split them!
    class UnifiedRectangle {
        private width: number;
        private height: number;
        private color: string;
        private borderColor: string;

        constructor (width: number, height: number, color: string, borderColor: string) {
            this.width = width;
            this.height = height;
            this.color = color;
            this.borderColor = color;
        }

        public calculateArea(): number {
            return this.width * this.height;
        }

        public invertColors(): void {
            this.color = `-${this.color}`;
            this.borderColor = `-${this.borderColor}`;
        }   
    }

    const unifiedRectangle = new UnifiedRectangle(1, 1, 'black', 'pink');
    // unifiedRectangle.doSomething()

    // vs

    class Rectangle {
        private algebraicRectangle: AlgebraicRectangle;
        private coloredRectangle: ColoredRectangle;

        constructor (width: number, height: number, color: string, borderColor: string) {
            this.algebraicRectangle = new AlgebraicRectangle(width, height);
            this.coloredRectangle = new ColoredRectangle(color, borderColor);
        }

        public calculateArea(): number {
            return this.algebraicRectangle.calculateArea();
        }

        public invertColors(): void {
            return this.coloredRectangle.invertColors();
        }  
    }

    class AlgebraicRectangle {
        private width: number;
        private height: number;

        constructor (width: number, height: number) {
            this.width = width;
            this.height = height;
        }

        public calculateArea(): number {
            return this.width * this.height;
        }
    }

    class ColoredRectangle {
        private color: string;
        private borderColor: string;

        constructor (color: string, borderColor: string) {
            this.color = color;
            this.borderColor = color;
        }

        public invertColors(): void {
            this.color = `-${this.color}`;
            this.borderColor = `-${this.borderColor}`;
        }   
    }

    const rectangle = new Rectangle(1, 1, 'black', 'pink');
    // rectangle.doSomething()

    // Result - two small cohesive classes that are hidden under a unifying delegator

// Organizing for change
    // OCP - In an ideal system, we incorporate new features by extending the system, not by making modifications to existing code.

// Isolating from Change
    // DIP - Classes should depend on abstractions, not on implementation details