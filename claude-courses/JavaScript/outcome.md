# JavaScript Fundamentals — Outcome Tracker

## Solid Understanding
- **Prototypes**: [[Prototype]] chain and lookup mechanics, Object.getPrototypeOf() vs __proto__, memory efficiency through shared methods, constructor functions and `.prototype` property, ES6 classes as syntactic sugar
- **Context (`this`)**: Call-site determines `this`, the 4 binding rules (default, implicit, explicit, new), priority order, `call()`/`apply()`/`bind()` usage, arrow functions and lexical `this`
- **Common `this` gotchas**: Method extraction loses context, callbacks lose implicit binding, event listeners binding
- **Async**: Event loop model (call stack, microtask queue, macrotask queue), execution order, Promises (pending/fulfilled/rejected), chaining, error handling with `.catch()`
- **Promise combinators**: `Promise.all` (fail-fast), `Promise.race` (first settled), `Promise.allSettled` (all results)
- **async/await**: Syntactic sugar over Promises, try/catch error handling, parallel execution with `Promise.all` vs sequential `await`
- **ES6+ features**: `let`/`const` vs `var` (block scope, TDZ, hoisting), arrow functions, destructuring (arrays, objects, nested, parameters), spread/rest operators, template literals, tagged templates
- **Modern operators**: Optional chaining (`?.`), nullish coalescing (`??`), `??` vs `||` distinction
- **DOM manipulation**: `querySelector`/`querySelectorAll`, creating/modifying elements, `textContent` vs `innerHTML`
- **DOM performance**: Rendering pipeline (Style → Layout → Paint → Composite), layout thrashing, batching reads/writes, `requestAnimationFrame`, `DocumentFragment` for batch insertions

## Partial / Needs Refinement
- **Closures**: Not explicitly covered in the checklist — the concept of functions retaining access to their lexical scope. Underpins module patterns, data privacy, and many interview questions
- **Event delegation**: The checklist covers DOM querying and performance but not the pattern of attaching a single listener to a parent instead of N listeners to children. Essential for dynamic lists
- **WeakMap/WeakSet**: Not covered — important for avoiding memory leaks with object references, used in frameworks internally
- **Generators and iterators**: Not in checklist — `function*`, `yield`, the iterable protocol. Powers `for...of` and async iteration
- **Module systems**: CommonJS vs ES Modules (`require` vs `import/export`) — fundamental for any project but absent from the checklist
- **Error handling patterns**: The checklist mentions try/catch in async but doesn't cover error handling strategy broadly (custom errors, error boundaries, graceful degradation)

## Gaps — Not Yet Covered
- **Closures** — lexical scope retention, practical patterns
- **Module systems** — CJS vs ESM, dynamic imports
- **Generators & iterators** — function*, yield, iterable protocol
- **WeakMap/WeakSet/WeakRef** — weak references and memory management
- **Event delegation** — efficient event handling for dynamic content
- **Proxy/Reflect** — metaprogramming (powers Vue 3 reactivity)
- **Regular expressions** — patterns, groups, lookahead/lookbehind
- **Web APIs** — fetch, AbortController, IntersectionObserver, MutationObserver

## Lessons Completed
- **Lesson 01 — Prototypes**: Covered via checklist (prototypes.js)
- **Lesson 02 — Context & `this`**: Covered via checklist (context-methods.js)
- **Lesson 03 — Async JavaScript**: Covered via checklist (async.js)
- **Lesson 04 — ES6+ Features**: Covered via checklist (es6.js)
- **Lesson 05 — DOM Manipulation**: Covered via checklist (dom.js)
