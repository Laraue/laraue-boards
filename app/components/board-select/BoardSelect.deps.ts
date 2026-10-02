export type BoardSelectOption = {
  label: string
  value: string
}

export type BoardSelectDeps = {
  loadBoards: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<BoardSelectOption[]>
}
