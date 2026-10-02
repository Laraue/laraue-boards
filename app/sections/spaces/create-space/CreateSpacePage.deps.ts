export type CreateSpaceInput = {
  color: string
  key: string
  name: string
}

export type CreateSpacePageDeps = {
  // Resolves with the key the backend gave the new space.
  create: (input: CreateSpaceInput) => Promise<string>
}
