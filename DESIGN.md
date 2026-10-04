# Interface design system

The shared tokens live in `app/assets/css/tokens.css`. Component appearance belongs to the base
component; page styles own layout. Extend the existing system before adding a component or variant.

## Typography

- Use `--font-size-body` (14px) for controls: buttons, text fields, selects, menu options and
  checkbox labels. Compact controls use the same text size.
- Use `--font-size-small` (12px) for secondary metadata, not interactive options.
- Reserve `--font-size-caption` (11px) for small annotations and avatar initials.
- Use heading sizes for hierarchy, not to distinguish controls.
- Never change font weight, text size or spacing on hover, focus or selection. Show state through
  color, background, border or a selection marker.
- Hover on form controls and action buttons changes the border only. Keep fill and text color
  unchanged; use `--color-border-hover` for neutral controls and semantic border colors for primary
  and destructive actions. Selected values retain their selection markers.
- Menu rows use a soft hover background instead of a border. Text size, weight and color stay
  unchanged. Expanded filters keep their active background.

## Controls

- Default height: `--control-height` (36px), including menu rows. Icon buttons use
  `--control-height-small` (32px).
- Compact height: `--control-height-small` (32px), only for intentionally dense layouts such as
  issue Properties and editable table cells. Button `size="small"` changes height and padding, not
  typography.
- `BaseSelect` default is the framed form field. `variant="inline"` is the transparent,
  content-width control for Properties and tables. Both share the same 14px text and option styling.
- `BaseButton` variants express intent: neutral, primary, danger, ghost. The `menu` prop changes
  alignment and framing, not text size. Combine it with danger for destructive menu actions.
- Use `BaseCheckbox` for labeled checkbox options and `IconButton` for icon actions.
- Main icons use `--icon-size` (16px). Direction chevrons use 12px.
- Control radius: `--radius-control` (8px). Space follows the existing 4px scale.

## Popovers and filters

- `AppPopover` owns surface color, border, radius and shadow. Consumers specify content layout and
  width; do not override its surface styles.
- Filters expand one section inside the panel on click or tap, on both desktop and mobile. Use
  native buttons for keyboard access; do not open sections on hover.
- Set panel width through `--app-popover-width`. Its content occupies 100% of the available inner
  width, including the panel's border in the sizing calculation.
- Keep one reset-all icon in the filter menu header. No per-filter reset buttons. Individual
  checkbox options can be deselected normally.
- Keep option text in `--color-text`; use muted text for secondary context only.

## Changes

Prefer changing a shared component or token over applying local `:deep()` overrides. New variants
need a distinct, existing use case. Preserve behavior during visual migrations; migrate legacy
screens incrementally rather than adding new size scales.
