import type { components } from '#infrastructure/api/generated'

export const boardStatusAppearance = {
  Active: { category: 'InProgress', color: 'var(--color-warning)', variant: 'warning' },
  Done: { category: 'Completed', color: 'var(--color-success)', variant: 'success' },
  New: { category: 'Created', color: 'var(--color-muted)', variant: 'neutral' },
} as const satisfies Record<components['schemas']['EpicStatus'], unknown>
