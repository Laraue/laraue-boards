export type BoardSelectOption = {
  label: string
  value: string
}

export type BoardSelectDeps = {
  // Resolves with the options or rejects with an `ApiError`.
  loadBoards: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<BoardSelectOption[]>
}
