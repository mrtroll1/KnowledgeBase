A TypeScript fundamentals course to complete with Claude Code.

## Prerequisites

Tools to have installed:
 - claude
 - node (v18+)
 - npm or yarn
 - TypeScript (`npm install -g typescript`)
 - ts-node (`npm install -g ts-node`)

## Quick Start — Running TypeScript

### 1. Check your setup

```bash
tsc --version
node --version
```

### 2. Compile and run a file

```bash
# Compile to JS then run
tsc myfile.ts && node myfile.js

# Or run directly with ts-node
ts-node myfile.ts
```

### 3. Initialize a project (optional)

```bash
tsc --init    # creates tsconfig.json with sensible defaults
```

> `tsconfig.json` controls compiler options like `strict` mode, target ES version,
> and module resolution. For learning, the defaults with `"strict": true` are ideal
> because they enable all the type-checking features we'll cover.

---

## Course Structure

| Lesson | Topic | Key Concepts |
|--------|-------|--------------|
| 01 | Type System Basics | Annotations, inference, basic types, aliases vs interfaces, unions, intersections, literals |
| 02 | Advanced Types | Type guards, generics, utility types, mapped types, conditional types, template literal types |
| 03 | Classes & Patterns | Access modifiers, abstract classes, structural typing, declaration merging, assertions vs narrowing |

Each lesson directory contains:
- `lesson.md` — the main teaching material
- `quiz.md` — 5 questions to test understanding
- `answers.md` — detailed explanations

---

## How to Use This Course

1. Read each lesson's `lesson.md` carefully
2. Try the code examples in your editor — experiment, break things
3. Take the quiz **without** looking at answers
4. Check `answers.md` and revisit anything you got wrong
5. Move to the next lesson when you feel solid

---

## Tracking Progress

See `outcome.md` for a running log of what you've learned and where gaps remain.
