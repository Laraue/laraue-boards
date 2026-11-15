# Working rules

- Never run `pnpm install`, `pnpm i`, or `pnpm add`; the user installs dependencies.
- Don't run any commands to run checks until I ask you to. If I ask you to run a full check, run
  `pnpm pre-commit`.
- Do not edit generated API types manually.
- Do not use the `in` operator for runtime checks or type narrowing. Use a typed discriminator,
  status field, or an explicit type-safe helper instead.
- Pages and components are independent: keep their types, deps, implementations, and helpers
  with their owner. Reusable components belong in `app/shared/components`; shared constants
  belong in `app/shared/constants`. API mapping belongs in the owner's `.deps.impl.ts`, not
  section-level `shared/api` or `shared/model` layers. Do not import another page into a page.
- A component used by one parent belongs in that parent's `components/` directory, together
  with its types, deps, implementation, and tests. Promote it to `app/shared/components` only
  when multiple independent parents use it; tests and deps wiring do not count as extra parents.
