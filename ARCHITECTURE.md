# Frontend Page Section Architecture

## Core principle

A page in `app/pages` is a thin Nuxt integration point. It reads route parameters, creates the API
client and dependency implementations, passes them to a page section, and handles navigation. It
does not contain business rules, API-data mapping, or UI state.

A page section lives in `app/sections/<domain>/<section>`. Its root Vue component owns the page UI:
it renders state, keeps UI state, calls dependencies, and reports navigation events through callback
props.

The data flow is:

```
route/page → page section → typed dependency → deps-impl → API
route/page ← navigation callback ← page section ← result/view model
```

## Page section structure

A typical page section contains:

- `<Feature>.vue` — UI and user flow.
- `<Feature>.types.ts` — types owned by the component: its view model, form data, and public values
  used by the component or its consumers.
- `<Feature>.deps.ts` — the component's external-operation contract. It is based on types from
  `.types.ts`, never the other way around.
- `deps-impl/` — real API work. Each operation has its own file; `index.ts` only composes them into
  the dependency object.
- `<Feature>.browser.test.ts` — a test for user-visible behaviour when the flow has meaningful
  regression risk.
- `deps-impl/*.test.ts` — a unit test for mapping and response handling when an implementation
  contains meaningful transformation or branching.

A nested component lives in its parent's `components/` directory. A component module groups its
files in a PascalCase directory, and its direct child components always live in its own
`components/` directory. Component-owned types shared with its dependencies or consumers live in
`<Component>.types.ts`; keep local-only types in the component and do not collect nested-component
types in the page's `.types.ts`. External operations use `<Component>.deps.ts` and `deps-impl/`. The
parent receives nested dependencies in its contract, while the composition root in
`deps-impl/index.ts` builds the dependency tree.

## Component code conventions

Each Vue component keeps its mutable UI state in one `reactive` object named `state`. Computed
values, template refs, model refs, and refs returned by composables are not component-owned mutable
state and remain separate.

Separate logical groups of top-level declarations, functions, watchers, and style rules with blank
lines. Keep lines that form one declaration or one control-flow block together.

## Contracts and API boundary

Components do not know about `ApiClient`, URLs, DTOs, or HTTP details. They receive functions
through `deps` and work with their own inputs and view models.

`deps-impl` is the only API boundary. It sends requests, maps generated API types to component-owned
types, and returns a consistent result:

- `QueryResult` for reads: data or an error code;
- `ActionResult` for changes: data, an error, or a validation error.

Use `executeQuery` and `executeAction` for normal reads and actions. They keep network and
validation errors consistent, while API-response mapping stays next to its operation. A loader that
combines several requests still returns the same contract and does not expose API details.

Vue components use `useQuery` for loading, retry, pending state, and query errors. They use
`useAction` for mutations, pending state, validation errors, and action errors. The component only
defines UX: what to render, when to refresh, whether to update optimistically, and where to
navigate.

## Adding a page section

1. Create the root page section component and describe the page UI there.
2. Move component-owned types to `<Feature>.types.ts`.
3. Define only required external operations in `<Feature>.deps.ts`, using those types.
4. Implement each operation separately in `deps-impl/` and map API data at that boundary.
5. Compose the dependencies in `deps-impl/index.ts`.
6. Add a thin Nuxt page: route values, `useApiClient`, dependency creation, and navigation
   callbacks.
7. Add a browser test for a real user outcome: form submission, an error, navigation, filtering,
   closing a dialog, or another observable flow. Do not test implementation details or every prop.
8. Add a unit test next to a dependency implementation when it maps API data, handles multiple
   response paths, or normalizes values. TypeScript cannot verify semantic mapping such as a wrong
   fallback, enum conversion, filtered item, URL, or status mapping. Skip a unit test for trivial
   passthrough implementations.
