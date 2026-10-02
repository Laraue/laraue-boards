export type StatusSelectOption = {
  label: string
  value: string
}

export type StatusSelectDeps = {
  loadStatuses: (input: { boardId: string; signal?: AbortSignal }) => Promise<StatusSelectOption[]>
}
