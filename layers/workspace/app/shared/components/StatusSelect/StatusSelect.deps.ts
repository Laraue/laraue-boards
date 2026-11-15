import type { components } from '#infrastructure/api/generated'

export type StatusSelectOption = {
  category?: components['schemas']['StatusCategory']
  // Colors the category indicator; without it the indicator is muted.
  color?: string
  label: string
  value: string
}

export type StatusSelectDeps = {
  loadStatuses: (input: { boardId: string; signal?: AbortSignal }) => Promise<StatusSelectOption[]>
}
