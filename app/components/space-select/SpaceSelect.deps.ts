export type SpaceSelectOption = {
  label: string
  value: string
}

export type SpaceSelectDeps = {
  // Resolves with the options or rejects with an `ApiError`.
  loadSpaces: (input: {
    organizationId?: string
    signal?: AbortSignal
  }) => Promise<SpaceSelectOption[]>
}
