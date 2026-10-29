# Frontend Architecture

## Core principle

A page in a layer's `app/pages` is a thin Nuxt integration point. It reads route parameters, creates
the API client and dependency implementations, passes them to a page section, and handles
navigation. It does not contain business rules, API-data mapping, or UI state.

The frontend has three independent product areas in one Nuxt application and deployment. Each is a
Nuxt layer with its own pages, layouts and code, and they share only the `core` layer:

- `layers/workspace/` — the working application: sign-in, organizations, issues, boards, billing,
  and retro.
- `layers/site/` — the public website: landing, comparison, and legal pages.
- `layers/docs/` — the documentation: its pages, the server that renders the markdown, and the
  articles.
- `layers/core/` — what the areas share: the root `app.vue`, the UI kit, language, theme, branding,
  the public header and footer, analytics consent and the common error view.

Nuxt registers the folders in `layers/` automatically. Import a layer's code through its alias,
`#layers/<name>/app/...` (the alias points to the layer's root); `~` is not used, because inside a
layer it points to the host instead. An area imports only itself and `#layers/core`; the
`architecture/import-boundaries` ESLint rule checks this.

Each area's root page components own their UI: they render state, keep UI state, call dependencies,
and report navigation events through callback props. Routes and layouts connect the area to Nuxt.

Organization links are passed through the `organizationRoutes` prop. Only routes and Nuxt layouts
call `useOrganizationRoutes`; sections and nested components do not read the current organization
from the router. `createOrganizationRoutes` can build the same links from an explicit organization
key without a Nuxt context.

API clients receive an explicit unauthorized-response policy. Signed-in routes pass
`useApiClient({ onUnauthorized: useSignInRedirect() })`; routes that handle sign-in themselves pass
`useApiClient({})`. Layout names only select the page shell and do not control API redirects.

The root `app.vue` explicitly starts the consent controller and applies changes in consent and
route. Its dependency implementation adapts browser storage, country detection, and Google
Analytics; no auto-registered consent plugin runs behind the root's back. The Telegram Mini App SDK
is loaded and awaited by the dependencies that read Mini App data, not by the global shell.

The landing page computes schema.org offers from its tariff data and passes them to its SEO
composable. Rendering the pricing component does not write shared state or change SEO.

## Ownership and directories

```text
layers/
  core/
    app/
      app.vue, error.vue         The root and the common error page.
      layouts/landing.vue        The frame of the public pages (site and docs).
      ui/                        Generic UI kit: components, composables, and styles.
      i18n/                      Typed translations and the Nuxt i18n adapter.
      preferences/               Theme and interface-language preferences.
      public-shell/              Header and footer of the site and the docs, with their links.
      analytics/                 Public-page analytics and consent owned by the app root.
      branding/                  Product logo and icons.
      constants/                 External links, preview images and the seller details.
      errors/                    The common application error view.
  site/app/
    pages/                       Landing, comparison and terms routes.
    sections/                    Landing, comparison, and legal pages with their own components.
  docs/
    app/                         Documentation UI, its route, dependencies and components.
    server/                      Markdown parsing, rendering, the catalog and its endpoints.
    shared/                      Types shared by the client and the server.
    content/                     The articles, per language.
  workspace/app/
    pages/, layouts/             Route integration, dependency creation and page shells.
    sections/<domain>/<page>/    A workspace page and its private implementation.
    sections/<domain>/shared/    Code reused by workspace pages within or across domains.
    shared/                      Workspace components, composables, utilities, and constants.
    shells/                      Organization navigation and the standalone sign-in/account frame.
server/plugins/                  Host-level server plugins.
infrastructure/                  API transport, generated types, and realtime transport.
```

Each page section owns its implementation. Keep its components, composables, dependency contracts,
implementations, and tests together. Do not import another page's private components or helpers.
Move code with several consumers to its domain's `shared/`, or to `layers/workspace/app/shared/`
when several workspace domains use it. Cross-domain consumers within the workspace may import a
domain's shared modules. Reuse between areas uses the UI kit, the public shell, or a concrete host
concern such as `layers/core/app/i18n/`. Do not create a generic shared bucket or import another
area's private code.

A section can also be embedded through its root component and dependency contract, as `IssuePage` is
embedded in the issue dialog. This does not make its private components public.

Landing components stay in `layers/site/app/sections/landing/`; documentation components stay in
`layers/docs/app/`. Workspace page frames live in `layers/workspace/app/shells/`. The public header
and footer live in `layers/core/app/public-shell/`, because both site and docs use this shell.
Seller details are constants (`core/app/constants/sellerDetails.ts`): the footer and the offer both
show them. A page's own text lives in its component (the offer in `TermsPage.vue`).

Component styles are scoped and live with their owner, including the shared `BrandLogo`. The UI kit
owns element defaults and tokens. Workspace page defaults live in its `app/assets/css/pages.css` and
are fenced under workspace roots; public-page defaults belong to the `landing` layout.

The UI kit knows nothing about application domains or translations. Workspace-only clients,
organization routing, tours and composables stay in `layers/workspace/app/`. A page-specific helper
stays next to its page. A component gets a dependency contract when it needs external operations;
ordinary child components do not need empty contracts or factories.

Computations such as translation, price offers, date formatting and action-error classification are
plain functions with explicit inputs. Small composables adapt these functions to the framework or a
genuinely shared UI concern. Locale and theme are not threaded through every component.

`@nuxtjs/i18n` owns public routing with `prefix_except_default`: English `/...`, Russian `/ru/...`.
Documentation keeps its published `/en/documentation/...` and `/ru/documentation/...` URLs through
the page's `meta.i18n.paths`. The workspace layer's config marks all its pages with
`meta.i18n: false` in the `pages:extend` hook, so they keep their unprefixed URLs and pages do not
repeat the flag. Every site page exists in every language. The deprecated `defineI18nRoute` macro is
not used. Workspace language comes from its preference; a public page's language comes from its URL.
Use `useLocalePath` and `useSwitchLocalePath` for internal public links, not concatenated language
prefixes. Public links resolve directly to canonical routes without legacy-address middleware. Only
`/` lets the module choose the saved or browser language. The workspace's locale plugin restores the
cookie or browser language through `i18n:beforeLocaleSwitch` on initial load of an unlocalized page.

Language selectors use the module's configured `locales`, including their names. Public pages add
the hreflang links with `useHead(useLocaleHead())`; every page, documentation articles included,
exists in both languages, so the links and the language switch keep the path. Canonical, og tags and
the title template come from `nuxt-seo-utils`, structured data from `nuxt-schema-org`
(`useSchemaOrg` with `define*` nodes; the Organization is configured once in `nuxt.config.ts`). The
`landing` layout sets what all public pages share: robots, the zoomable viewport and the preview
image. The preview image of each language is `previewImageUrl` in `core/app/constants/links.ts`.
Public UI components read the shared locale directly; only page data loading and pure functions
receive it as an argument.

`layers/core/app/i18n/useI18n.ts` preserves local message objects and requires all languages and
keys. Its translation engine is the pure `createTranslator`; the adapter reads the module's current
locale. `layers/core/app/i18n/translator.type-test.ts` contains compile-time regression cases.

Confirmations and notifications have one service instance per Nuxt app, created through small UI
composables. Mutable dialog requests, timers and counters live inside that instance, not at module
scope. The app root renders their hosts and owns consent state. The mobile sidebar belongs to one
organization shell and is provided only to that shell's descendants.

The refresh button is explicit: a section that wants one passes its own `refresh` to its
`PageHeader` as `onRefresh`, and the header shows the button only then. Shells, layouts and page
wrappers do not carry refresh callbacks. A section that must reload several queries (the issue page
with its comments and history, the board with its open issue dialog) lists those calls in its own
refresh function; only those nested parts expose `refresh`. Refresh keeps the components mounted,
including filters, scroll and unsaved edits.

All dependencies use explicit imports, including UI-kit components, composables, utilities, Vue
APIs, Nuxt APIs, and server helpers. Nuxt composable scanning, automatic import injection, project
component discovery, and Nitro auto-imports are disabled. Vue compiler macros such as `defineProps`
and `defineModel` remain compiler syntax and need no imports.

Import project components and helpers from their files. `#components` is reserved for explicit
imports of Nuxt built-ins such as `NuxtLink` and `NuxtPage`. `#imports` is reserved for external
module exports, including `useGtag` and the Nuxt i18n composables. Do not use either registry for
project code or resolve a component by its global name.

ESLint validates resolved local paths for static imports, re-exports, dynamic imports, and import
types. The same boundaries apply to aliases and relative paths. Workspace, site, and docs cannot
import one another; host utilities cannot import a product area; the public shell may compose site
navigation; the UI kit cannot import app code; server and infrastructure code cannot import the
client; root shared contracts depend only on other root shared code. Routes and layouts may compose
the client areas. Dynamic module paths must be literals so the rule can identify the target. Vue
templates must explicitly import their components. The rule and its regression cases live in
`tools/eslint/`.

Server code must not import from a layer's `app/`. Documentation processing belongs to
`layers/docs/server/docs/`; the types shared by the client and the server belong to
`layers/docs/shared/` (relative imports). That directory holds only those types, not general client
code.

The data flow is:

```
route/page → page section → .deps.ts contract → .deps.impl.ts implementation → API
route/page ← navigation callback ← page section ← result/view model
```

## Page section structure

A typical page section contains:

- `<Feature>.vue` — UI and user flow.
- `<Feature>.deps.ts` — everything related to the dependency contract: external operations, their
  inputs, results, view models, and nested dependency contracts.
- `<Feature>.deps.impl.ts` — dependency implementations: API requests, data mapping, and composition
  of the dependency object, including nested dependencies.
- `<Feature>.types.ts` — optional public component types that are not part of the dependency
  contract. Keep local-only types in the component.
- `<Feature>.browser.test.ts` — a test for user-visible behaviour when the flow has meaningful
  regression risk.
- `<Feature>.deps.impl.test.ts` — a unit test for mapping and response handling when an
  implementation contains meaningful transformation or branching.

A nested component lives in its parent's `components/` directory. A component module groups its
files in a PascalCase directory, and its direct child components always live in its own
`components/` directory. Dependency contracts and their related types live in `<Component>.deps.ts`;
other public component types may live in `<Component>.types.ts`. Keep local-only types in the
component and nested-component types next to their owner. External operations are implemented in
`<Component>.deps.impl.ts`. The parent receives nested dependencies in its contract, while its
`.deps.impl.ts` builds the dependency tree. Do not create a `deps-impl/` directory or require a
separate file for each operation.

## Component code conventions

Each Vue component keeps its mutable UI state in one `reactive` object named `state`. Computed
values, template refs, model refs, and refs returned by composables are not component-owned mutable
state and remain separate.

Separate logical groups of top-level declarations, functions, watchers, and style rules with blank
lines. Keep lines that form one declaration or one control-flow block together.

## Contracts and API boundary

Components do not know about `ApiClient`, URLs, DTOs, or HTTP details. They receive functions
through `deps` and work with their own inputs and view models.

`.deps.impl.ts` files form the API boundary. They send requests, map generated API types to the
types described by dependency contracts, and return data on success or throw an `ApiError` on
request failure.

Use `request` for normal reads and actions. It keeps network and validation errors consistent, while
API-response mapping stays next to its operation. A loader that combines several requests still
returns component-owned data and does not expose API details. Dependencies with domain problems can
catch `ApiError` and return their own typed result.

Workspace components use `useApiQuery` for loading, retry, pending state, and query errors. They use
`useApiAction` for mutations, pending state, validation errors, and action errors. The component
only defines UX: what to render, when to refresh, whether to update optimistically, and where to
navigate.

The site and the docs load their few queries with Nuxt's `useAsyncData` directly; core holds no
data-loading helpers. Everything only one area uses lives in that area.

## Adding a page section

1. Create the root page section component and describe the page UI there.
2. Define only required external operations and all dependency-related types in `<Feature>.deps.ts`.
3. Implement the operations and map API data in `<Feature>.deps.impl.ts`.
4. Compose the dependency object and nested dependencies in the same `.deps.impl.ts` file.
5. Add a thin Nuxt page: route values, the required API client, dependency creation, and navigation
   callbacks. Import workspace-only clients and helpers explicitly.
6. Add a browser test for a real user outcome: form submission, an error, navigation, filtering,
   closing a dialog, or another observable flow. Do not test implementation details or every prop.
7. Add a unit test next to a dependency implementation when it maps API data, handles multiple
   response paths, or normalizes values. TypeScript cannot verify semantic mapping such as a wrong
   fallback, enum conversion, filtered item, URL, or status mapping. Skip a unit test for trivial
   passthrough implementations.

Tests stay next to the code they cover. When moving code between layers or into `server/` or
`infrastructure/`, keep its tests included in `vitest.config.ts` and `tsconfig.test.json`, and
update relative fixture paths.
