export type StatusSelectOption = {
  // Colors the status's dot; without it the dot is muted.
  color?: string
  label: string
  value: string
}

export type StatusSelectDeps = {
  loadStatuses: (input: { boardId: string; signal?: AbortSignal }) => Promise<StatusSelectOption[]>
}
