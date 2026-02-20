TypeScript is here to solve the problem of JavaScript horribly handling types.
Surprisingly, there is even a native TypeError in js.
``` js
const message = 'Hello';
message() // Run-time TypeError
```
But js is inconsistent. For example, 
```js
const user = {
    name: 'Luka',
    age: 23
}

const userHeight = user.height; // no error, userHeight is just 'undefined'
```
Better type handling - less bugs (they get detected during compile-time). 
tsc checks ts and compiles it into js-executables. The strciter the ts-config, the better!
<ul>
<li>--noEmitOnError - do not re-compile the file if tsc detected an error</li>
<li>--noImplicitAny - do not allow ambiguous 'any' type at all</li>
<li>--strictNullChecks  - do not allow null or undefined as subsititute fro any type</li>
</ul>

Three primitives: string, number, boolean. Array of type T: T[] Promise of type T: Promise <T>
These are used to type-annotate variables and functions, create custom object types and define composite types.

```typescript
type Point = {
    x: number;
    y: number;
}
type ID = number | string;
const id: ID;
id.toUpperCase() // error! only methods/fields that exist on every type of union type
type UserCoordinates = Point & {id: ID};
const uc: UserCoordinates = {
    x: 1;
    y: 1;
    id: 'user-1';
}
```

Another way to name a type is to use an interface. Only difference - interfaces are extendable (inheritance through interfaces)
Prefer interface for object shapes you expect to extend; use type for unions, mapped/conditional types.

In a lot of cases, TS does great job of type inference (variables, function return types, arrow function arg types). 
This allows us to avoid explicit type annotations. But I would say - always annotate.

Sometimes TS has no way of knowing that something is of a certain type. 
We can define a type-guard like

```typescript
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

Or in --strictNullChecks mode we can explicitly tell TS that something can not be null by doing 'something!'
Or, we can use generic function to perform type inference. 
In the block below, function has a return type of any. But it should strictly be the type of the array element.

```typescript
function firstElement(arr: any[]) {
  return arr[0];
}
``` 

Instead we can do

```typescript
function firstElement<Type>(arr: Type[]): Type | undefined {
    return arr[0];
}
```

Or can add additional constraints like 

```typescript
function longest<Type extends { length: number }>(a: Type, b: Type): Type {
    return a ? a.length >= b.length ? b;
}
``` 

Similarly, generic object typing

```typescript
interface Box<Type> {
  contents: Type;
}
 
interface Apple {
  // ....
}
 
// Same as '{ contents: Apple }'.
type AppleBox = Box<Apple>;
```

But since we are type checking a lot, what kind of types are treated as comptible except for exactly the same ones?
Rule: S is assignable to T if S has at least the non-optional properties of T with compatible types.
Tricky excess property check triggers when anonymous typing

```typescript
type R = { a: number };
const r1: R = { a: 1, extra: 2 };      // Error (excess property check)
const tmp = { a: 1, extra: 2 };
const r2: R = tmp;                      // OK (no fresh-literal check)
```

Classes are shape-compatible unless they have private or protected members!

```typescript
class A { x = 1; private p = 0; }
class B { x = 1; private p = 0; }

let a: A = new A();
let b: B = new B();

a = b; // Error: different private declarations
b = a; // Error
```

Type casting is really the last resort. 

```typescript
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

Prefer narrowing (by checks/guards) to assertions whenever possible—narrowing is checked, assertions are 'trust me bro'

Ts interfaces are 1. structural (shep matters, not explicit 'implements') 2. extendable (the same interface name can be declared multiple
    times — TS merges them) 3. can define properties too 4. can extend multiple interfaces