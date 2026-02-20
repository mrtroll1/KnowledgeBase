A Vue 3 (Composition API) course to complete with Claude Code.

## Prerequisites

Tools to have installed:
 - claude
 - node (v18+)
 - yarn

## Quick Start — Running the Playground App

### 1. Install dependencies

```bash
cd ClaudeCourses/Vue
yarn
```

### 2. Start the dev server

```bash
yarn dev
```

The app includes working example components for each lesson topic — edit them live as you learn.

## Course Structure

Each lesson is in `lessons/<number>-<topic>/` with:
- `lesson.md` — Main teaching content with A/B comparisons and code examples
- `quiz.md` — Questions to test understanding
- `answers.md` — Quiz solutions

The `src/components/` directory contains matching Vue components you can run and modify.

## Lessons

| # | Topic | Key Components |
|---|-------|---------------|
| 01 | Reactivity Fundamentals | `ReactivityFundamentals.vue` |
| 02 | Template Syntax | `TemplateSyntax.vue` |
| 03 | Computed Properties & Watchers | `ComputedProperties.vue`, `Watchers.vue` |
| 04 | Bindings & List Rendering | `ClassAndStyleBindings.vue`, `ListRendering.vue` |
| 05 | Form Input Bindings | `FormInputBindings.vue` |
| 06 | Component Props & Events | `Props.vue`, `DeepChild.vue` |
| 07 | Composables | `Composables.vue`, `src/composables/` |
| 08 | Async Components & Render Functions | `AsyncComponents.vue`, `RenderFunctions.vue` |
| 09 | Transitions & Teleports | `Transitions.vue`, `Teleports.vue` |
| 10 | TypeScript & Debugging | `TypeScript.vue`, `Debugging.vue` |
| 11 | Accessibility | `Accessible.vue` |
