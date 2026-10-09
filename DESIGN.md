# Interface design system

The shared tokens live in `app/components/ui/styles/tokens.css`, the kit's element defaults in
`ui/styles/base.css`; app-wide styles stay in `app/assets/css/main.css`. Component appearance
belongs to the base component; page styles own layout. Extend the existing system before adding a
component or variant. Every shared component and its states are on `/dev/ui` (development only);
check a design change there and add new components and variants to it.

## UI kit and app components

- `app/components/ui/` is the UI kit that will move to its own library: generic `Base*` components
  (Button, IconButton, Input, Select, Checkbox, Tabs, Tooltip, Card, Popover, Menu, Toasts,
  EmptyState) and their composables (`ui/composables`, e.g. `useToast`). Nuxt registers them under
  their own names.
- The kit imports only from itself, Vue, Nuxt and third-party packages; ESLint blocks `~/`,
  `#infrastructure` and imports out of `ui/`. It has no translations and no domain words: text comes
  in through props or slots (e.g. `BaseToasts dismiss-label`). Auto-imported app composables such as
  `useI18n` are off limits too, though lint cannot see them.
- Everything that knows about issues, boards, spaces, users or this app's copy is an app component
  outside `ui/` (`App*` or a domain name). A generic need found in an app component moves into the
  kit.

## Units

- Size tokens (spacing, type, radius, control and icon sizes, page widths) are in rem, so the whole
  interface grows with the browser's font size. Write new sizes through tokens; a raw length in a
  component is rem too. Borders, shadows and focus rings stay in px.

## Colors

- Two layers in `tokens.css`. Primitives (`--gray-1..12`, `--blue-1..12`, `--red/green/amber-3` and
  `-11`) are raw ramps, redefined per theme from the background end (1) to the text end (12).
  Semantic roles (`--color-*`) point at primitives and are the only colors components use.
- Never reference a primitive or a hex value in a component; add or remap a semantic role instead.
- Text: `--color-text`, `--color-muted` for secondary context, `--color-text-subtle` for hints. Text
  and icons on an action fill use `--color-on-action`.
- Chart colors are a separate data palette.

## Typography

- The type scale is `--font-size-xs` (11) `sm` (12) `md` (14) `lg` (16) `xl` (18) `2xl` (20) `3xl`
  (24) `4xl` (30), with `--line-height-body` (1.5) and `--line-height-heading` (1.25). Headings pick
  from the scale; body text uses the roles below. No sizes outside the scale.
- Use `--font-size-body` (14px) for controls: buttons, text fields, selects, menu options and
  checkbox labels. Compact controls use the same text size.
- Use `--font-size-small` (12px) for secondary metadata, not interactive options.
- Reserve `--font-size-caption` (11px) for small annotations and avatar initials.
- Use heading sizes for hierarchy, not to distinguish controls.
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
- `BaseButton` variants express intent: neutral, primary, danger, ghost. The `menu` prop changes
  alignment and framing, not text size. Combine it with danger for destructive menu actions.
- Use `BaseCheckbox` for labeled checkbox options and `BaseIconButton` for icon actions.
  `BaseIconButton` is `BaseButton icon` with a required accessible name and tooltip; style both in
  `BaseButton`.
- `BaseIconButton variant="danger"` is muted at rest and shows the danger color on a danger-soft
  fill on hover. `BaseSelect full-width` stretches an inline select to its layout column while
  keeping the shared inline appearance.
- Framed fields and bordered buttons carry `--shadow-control`; borderless (inline) ones drop it.
  Disabled fields use the soft fill and muted text.
- `BaseInput` owns text field variants. Its default is framed; `variant="inline"` is transparent for
  editable rows, with a border on hover and focus. `AppColorPicker compact` uses an icon button with
  a color sample for dense rows; the default shows the color name.
- `BaseTabs` is a segmented control (as in shadcn/ui): a soft 32px track as wide as its tabs, the
  active tab raised on a surface with the control shadow. Tabs are 14px, weight 500 in every state,
  with an icon and a count pill. Don't add other tab styles.
- Modal forms use `BaseDialog` (Reka Dialog: focus trap, Escape and backdrop press close it, scroll
  lock, focus returns on close): `title`, optional `description`, fields in the
  default slot, buttons in `#actions`; it emits `submit` and `close` and exposes `open()` and
  `close()`. It has a close button in the top corner (pass `close-label` with the app's word for
  "Close"). Opening focuses an `autofocus` element, else the first field,
  else the first action. Don't hand-build dialog headers, labels or action rows.
- `BaseBadge` is the one pill for counts, states and marks: neutral (counts, plain states), outline
  (a quiet mark like "alpha"), accent, success, warning, danger. One size; don't build local pills.
- `BaseAvatar` shows initials on a color: `sm` 20px next to a name in a row, `md` 32px in menus,
  lists and headings; `shape="square"` for organizations. Initials scale with the size; never set
  their font size.
- Main icons use `--icon-size` (16px). Direction chevrons use 12px.
- Four radii, one knob (`--radius`, 8px): `--radius-control` (= `--radius`) for everything
  interactive or floating (controls, tabs and their track, menu rows and options, popovers, menus,
  select lists, toasts, tooltips); `--radius-card` (`--radius` × 1.75, 14px) for cards and dialogs;
  `--radius-small` (4px) for checkboxes; `--radius-full` for pills and circles. No other radius:
  nested rows are not made smaller, one radius reads as one system. Space follows the 4px scale.

## Surfaces

- Group page content (lists, settings sections, summaries) in `BaseCard`: surface fill, border,
  `--radius-card` and `--shadow-card` on the page background. Do not rebuild these styles locally.

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
