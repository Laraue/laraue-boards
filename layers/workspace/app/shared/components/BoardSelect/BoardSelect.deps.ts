export type BoardSelectOption = {
  // Colors the board's icon; without it the icon is muted.
  color?: string
  isBacklog?: boolean
  label: string
  value: string
}

export type BoardSelectDeps = {
  loadBoards: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<BoardSelectOption[]>
}
