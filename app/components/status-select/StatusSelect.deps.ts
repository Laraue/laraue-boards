export type StatusSelectOption = {
  label: string
  value: string
}

export type StatusSelectDeps = {
  // Resolves with the options or rejects with an `ApiError`.
  loadStatuses: (input: { boardId: string; signal?: AbortSignal }) => Promise<StatusSelectOption[]>
}
