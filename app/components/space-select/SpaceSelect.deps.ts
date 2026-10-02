export type SpaceSelectOption = {
  label: string
  value: string
}

export type SpaceSelectDeps = {
  loadSpaces: (input: {
    organizationId?: string
    signal?: AbortSignal
  }) => Promise<SpaceSelectOption[]>
}
