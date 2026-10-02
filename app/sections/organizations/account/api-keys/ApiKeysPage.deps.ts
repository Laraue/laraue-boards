export type ApiKeyViewModel = {
  createdAt: string
  id: string
  keyPrefix: string
  lastUsedAt: null | string
  name: string
  revokedAt: null | string
}

export type ApiKeysPageData = {
  hasNextPage: boolean
  keys: ApiKeyViewModel[]
}

export type CreatedApiKey = {
  id: string
  rawKey: string
}

export type ApiKeysPageDeps = {
  // Resolves with the key itself, which is shown only this once.
  create: (input: { name: string }) => Promise<CreatedApiKey>
  revoke: (input: { id: string }) => Promise<void>
  view: (input: { page: number; signal?: AbortSignal }) => Promise<ApiKeysPageData>
}
