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
