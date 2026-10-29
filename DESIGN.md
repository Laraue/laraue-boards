# Interface design system

The shared tokens live in `layers/core/app/ui/styles/tokens.css`, the kit's element defaults in
`layers/core/app/ui/styles/base.css`; app-wide styles stay in `layers/core/app/assets/css/main.css`.
Component appearance belongs to the base component; page styles own layout. Extend the existing
system before adding a component or variant. Every shared component and its states are on `/dev/ui`
(development only); check a design change there and add new components and variants to it.

## UI kit and app components

- `layers/core/app/ui/` is the UI kit that will move to its own library: generic `Base*` components
  (Button, IconButton, Input, Select, Checkbox, Tabs, Tooltip, Card, Popover, Menu, Toasts,
  EmptyState) live in `components/`, with their composables in `composables/` (e.g. `useToast`).
  Import each component and composable explicitly from its file.
- The kit imports only from itself, Vue, Nuxt and third-party packages; ESLint resolves aliases and
  relative paths and blocks imports out of `ui/`. It has no translations and no domain words: text
  comes in through props or slots (e.g. `BaseToasts dismiss-label`). App composables such as
  `useI18n` are off limits. Auto-imports are disabled throughout the project.
- Buttons are `BaseButton` / `BaseIconButton` everywhere; the old `.primary`, `.secondary` and
  `.icon-btn` classes are gone from the app. The retro board page (retro-board/) lives apart and
  keeps them in `workspace/sections/retro/retro-controls.css`, which nothing else may use.
- Workspace-wide components live in `layers/workspace/app/shared/components/`, page frames in
  `layers/workspace/app/shells/`, and domain components in their page section or
  `layers/workspace/app/sections/<domain>/shared/components/`. Landing components stay in
  `layers/site/app/sections/landing/`; documentation components stay in `layers/docs/app/`. Only
  cross-area components belong to their actual host concern; the common public header and footer
  live in `layers/core/app/public-shell/`. A generic need found in an app component moves into the
  kit.

- A kit component's root rule is written `:where(.base-x) { ... }` when consumers set its layout
  through their own class (width, flex, alignment): the consumer's class then always wins. With
  equal weight the result would depend on stylesheet order, which differs between the server render
  and hydration.

## Units

- Size tokens (spacing, type, radius, control and icon sizes, page widths) are in rem, so the whole
  interface grows with the browser's font size. Write new sizes through tokens; a raw length in a
  component is rem too. Borders, shadows and focus rings stay in px.

## Colors

- Contrast is checked against WCAG AA: text 4.5:1 (badges included), focus and control boundaries
  that carry meaning 3:1. Focus is a 1px `--color-focus` line inside the element (its border, or
  `--shadow-focus` where it has none), never an outer glow.

- Two layers in `tokens.css`. Primitives (`--gray-1..12`, `--blue-1..12`, `--red/green/amber-3` and
  `-11`) are raw ramps, redefined per theme from the background end (1) to the text end (12).
  Semantic roles (`--color-*`) point at primitives and are the only colors components use.
- Never reference a primitive or a hex value in a component; add or remap a semantic role instead.
- Text: `--color-text`, `--color-muted` for secondary context, `--color-text-subtle` for hints. Text
  and icons on an action fill use `--color-on-action`.
- Lines come in three weights, quietest first: `--color-divider` for page structure (the sidebar's
  and the header's edges, lines between rows), `--color-border-surface` for group outlines (lists,
  cards, comments), `--color-border` for controls (fields, selects, buttons). A field must never
  read as page structure, so the control border stays the strongest in both themes.
- Chart colors are a separate data palette.

## Typography

- The type scale is `--font-size-xs` (11) `sm` (12) `md` (14) `lg` (16) `xl` (18) `2xl` (20) `3xl`
  (24) `4xl` (30), with `--line-height-body` (1.5) and `--line-height-heading` (1.25). Headings pick
  from the scale; body text uses the roles below. No sizes outside the scale.
- Use `--font-size-body` (14px) for controls: buttons, text fields, selects, menu options and
  checkbox labels. Compact controls use the same text size.
- Use `--font-size-small` (12px) for secondary metadata, not interactive options.
- Reserve `--font-size-caption` (11px) for small annotations and avatar initials.
- Use heading sizes for hierarchy, not to distinguish controls. The levels: a page or issue title
  `3xl` (24) weight 600; a section heading (`BaseSectionHeader`) `lg` (16) weight 600; body `md`
  (14); metadata `sm` (12), muted.
- Weights: 400 for body text, controls inside menus and options; 500 for buttons, row and card
  titles, page header titles and group labels; 600 and above only for page headings (h1, dialog
  titles). Group labels are sentence case, not uppercase.
- Never change font weight, text size or spacing on hover, focus or selection. Show state through
  color, background, border or a selection marker.
- Hover on bordered form controls and action buttons changes the border only. Keep fill and text
  color unchanged; use `--color-border-hover` for neutral controls and semantic border colors for
  primary and destructive actions. Borderless (ghost and icon) buttons show hover as a soft fill,
  like menu rows. Selected values retain their selection markers.
- Menu rows (BaseButton `menu`, select options, editor menus) use `--color-soft` as the hover
  background instead of a border, and 12px side padding. Text size, weight and color stay unchanged.
  Expanded filters keep their active background.

## Controls

- Default height: `--control-height` (32px), including menu rows. Icon buttons use
  `--control-height-small` (32px).
- Compact controls also use 32px. Button `size="small"` changes padding, not height or typography.
- `BaseSelect` default is the framed form field. `variant="inline"` is the transparent,
  content-width control for Properties and tables. Both share the same 32px height, 14px text and
  option styling.
- `BaseButton` variants express intent: neutral, primary, danger, ghost. Primary is filled
  (`--color-action`) under white text. Danger is a red label on a bordered button, a red menu row,
  or a muted icon that turns red; it is filled (`--color-danger-action`) only on the action of
  `BaseAlertDialog`, the step that actually deletes. The `menu` prop changes alignment and framing,
  not text size. Combine it with danger for destructive menu actions.
- A button carries an icon when it is an action in a page or section header (Add issue, New
  attribute, Create key, Invite, Change plan), a bulk action, or adds a row to a list (Add status,
  Add option): those are entry points people look for. Buttons inside the content (a form's Save,
  dialog buttons, a card's action, a danger zone) are text only. A page that is a form (to create a
  board, a space, an attribute, an organization, or a settings form) submits at the end of the form,
  above its danger zone, and a list inside it gets its add-row button under its rows, not in a
  header.
- Every view with server data is refreshed by the one `AppRefreshButton`, which `PageHeader` and the
  standalone header show first among their actions when their owner supplies `onRefresh`. Parents
  explicitly combine their own reload with the required child refresh methods; there is no automatic
  registration or global list. A refresh keeps the view mounted (`QueryState` shows its loading
  state only before the first answer).
- Use `BaseCheckbox` for labeled checkbox options and `BaseIconButton` for icon actions.
  `BaseIconButton` is `BaseButton icon` with a required accessible name and tooltip; style both in
  `BaseButton`.
- `BaseIconButton variant="danger"` is muted at rest and shows the danger color on a danger-soft
  fill on hover. `BaseSelect full-width` stretches an inline select to its layout column while
  keeping the shared inline appearance.
- Controls and cards are flat: a border, no shadow. Only floating surfaces (popovers, menus,
  dialogs, toasts) carry `--shadow-popover`. Disabled fields use the soft fill and muted text.
- `BaseInput` owns text field variants. Its default is framed; `variant="inline"` is transparent for
  editable rows, with a border on hover and focus. `AppColorPicker compact` uses an icon button with
  a color sample for dense rows; the default shows the color name.
- `BaseTabs` is a segmented control (as in shadcn/ui): a soft 32px track as wide as its tabs, the
  active tab on a surface fill, no shadow. Tabs are 14px, weight 500 in every state, with an icon
  and a count pill. Tabs that switch pages are `BaseNavTabs`: the same look, links marked
  `aria-current`. A choice between a few values (the theme) is the same track: buttons in
  `.base-tabs-list` / `.base-tabs-tab`, the current one `aria-pressed`. Don't add other tab styles.
- Settings pages with several sections (administration, your account in an organization) use
  `BaseSettingsLayout`: the sections as a vertical menu on the left (`BaseNavTabs vertical`), the
  current one beside it, at most 48rem wide. On narrow screens the menu runs across the top. Each
  section opens with `BaseSectionHeader` (its name and its actions on the right); a note that
  applies to every section goes under the menu (`aside` slot), not above the content. Groups inside
  a section are h3 at body size, weight 500, sentence case.
- Modal forms use `BaseDialog` (Reka Dialog: focus trap, Escape and backdrop press close it, scroll
  lock, focus returns on close): `title`, optional `description`, fields in the default slot,
  buttons in `#actions`; it emits `submit` and `close` and exposes `open()` and `close()`. It has a
  close button in the top corner (pass `close-label` with the app's word for "Close"). Opening
  focuses an `autofocus` element, else the first field, else the first action. Don't hand-build
  dialog headers, labels or action rows.
- Confirmations go through `useConfirm()`: `if (await confirm({ danger: true, title }))`. It shows a
  `BaseAlertDialog` (Reka AlertDialog) through the `BaseConfirmHost` in app.vue, focused on Cancel;
  the backdrop does not close it. Pass `action` when the default "Confirm" or, for `danger`,
  "Delete" does not name the action. Never call `window.confirm`; without a host (component tests)
  `useConfirm` falls back to it with the same text.
- `BaseBadge` is the one pill for counts, states and marks: neutral (counts, plain states), outline
  (a quiet mark like "alpha"), accent, success, warning, danger. One size; don't build local pills.
- `BaseAvatar` shows initials on a color: `sm` 20px next to a name in a row, `md` 32px in menus,
  lists and headings; `shape="square"` for organizations. Initials scale with the size; never set
  their font size.
- Main icons use `--icon-size` (16px). Direction chevrons use 12px.
- Radii come from one knob (`--radius`, 8px): `--radius-control` (= `--radius`) for everything
  interactive (controls, tabs, menu rows and options, tooltips); a surface that holds rows adds its
  padding, so its corner runs parallel to theirs: `--radius-popover` (`--radius` + 4px, 12px) for
  popovers, menus, select lists and toasts, and the tabs track is `--radius-control` + 3px;
  `--radius-card` (`--radius` × 1.75, 14px) for cards and dialogs; `--radius-small` (4px) for
  checkboxes; `--radius-full` for pills and circles. Nested rows are not made smaller. Space follows
  the 4px scale.

## Forms

- A labelled control is a `BaseField`: label (weight 500), the control, then an optional `hint`
  (muted, small) and `error` (danger, small). The control takes `id` and `describedby` from the slot
  props, or keeps its own id passed as `id`; a control that is not a single input (a color picker, a
  list of rows) takes `labelId` for `aria-labelledby`.
- Fields go in a `BaseFieldGroup`, which owns the space between them. Labels are always above their
  controls, never beside them: long or translated labels and narrow screens need no other layout. Do
  not space fields with label margins or local wrappers.
- Form-wide messages after a submit stay `.form-error` / `.form-success` under the fields.

## Surfaces

As in Jira, Linear and ChatGPT: one background, and fill is spent on the few layers that mean
something.

- One page background for the sidebar and the content (`--color-background`, the surface color in
  the light theme); the sidebar is set apart by a line, not by another fill. Gray is not a frame
  around white blocks: it marks only a board column, a hovered or selected row and soft pills.
- Data lists (issues, history) are rows on the page itself, with no box around them: a line between
  rows, `--color-row-hover` on hover: half a step under `--color-soft`, so the buttons inside a
  hovered row still show their own hover. A group inside such a list is a quiet muted label with
  space above it, never a fill: a filled band reads as a hovered row.
- Groups of settings and lists of things to manage (attributes, members, keys, connected accounts, a
  settings section) are outlined, as ChatGPT's and Linear's settings: `BaseList` of `BaseListRow`s
  or `BaseCard`, a `--color-border-surface` ring and `--radius-card`, no fill of their own. Rows are
  divided by lines: something in front, a title with a line under it, actions or a chevron at the
  end. Do not make each row its own card. Use a table only when rows have several columns to
  compare.
- A board is the one place where fill stacks: a column is a soft sunken band (`--radius-popover`),
  its cards are surface-filled and outlined (`--radius-control`), so they read against the band.
- Dialogs and floating surfaces (menus, popovers, select lists, toasts) keep their surface fill and
  `--color-border-surface` edge; controls keep the solid `--color-border`. Do not rebuild these
  styles locally.

- A destructive action of a settings page (delete the organization, the attribute) is not placed
  next to Save: it goes under the form in `BaseDangerZone`, with a line above it and one sentence on
  what it removes.

## Popovers and filters

- `BasePopover` is built on Reka `Popover`: Reka places it, flips it at the viewport edge and closes
  it on Escape or an outside press. It owns surface color, border, radius and shadow. Consumers
  specify content layout and width; do not override its surface styles.
- Menus of actions use `BaseMenu` with `BaseMenuItem` rows and `BaseMenuSeparator` (Reka
  DropdownMenu: arrow keys, Enter, typeahead). Call `preventDefault()` in an item's `select` to keep
  the menu open (theme and language switches). Panels with fields or sections use `BasePopover`.
- Filters expand one section inside the panel on click or tap, on both desktop and mobile. Use
  native buttons for keyboard access; do not open sections on hover.
- Set panel width through `--base-popover-width`. Its content occupies 100% of the available inner
  width, including the panel's border in the sizing calculation.
- Keep one reset-all icon in the filter menu header. No per-filter reset buttons. Individual
  checkbox options can be deselected normally.
- Keep option text in `--color-text`; use muted text for secondary context only.

## Changes

Prefer changing a shared component or token over applying local `:deep()` overrides. New variants
need a distinct, existing use case. Preserve behavior during visual migrations; migrate legacy
screens incrementally rather than adding new size scales.
