import type { ApiClient } from '#infrastructure/api/client'

import type { ApiKeysPageDeps } from '../ApiKeysPage.deps'
import { createApiKey } from './createApiKey'
import { revokeApiKey } from './revokeApiKey'
import { createViewApiKeys } from './viewApiKeys'

export const createApiKeysPageDeps = (client: ApiClient): ApiKeysPageDeps => ({
  create: createApiKey(client),
  revoke: revokeApiKey(client),
  view: createViewApiKeys(client),
})
