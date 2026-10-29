export type SpaceSelectOption = {
  // Colors the space's icon; without it the icon is muted.
  color?: string
  label: string
  value: string
}

export type SpaceSelectDeps = {
  loadSpaces: (input: {
    organizationId?: string
    signal?: AbortSignal
  }) => Promise<SpaceSelectOption[]>
}
