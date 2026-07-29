import type { components } from '#infrastructure/api/generated'

type Schemas = components['schemas']

export const createdAtDescending = {
  $type: 'property' as const,
  direction: 'Descending',
  property: 'CreatedAt',
} satisfies Schemas['IssueSorting']
