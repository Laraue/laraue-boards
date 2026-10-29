import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { CreateSpacePageDeps } from './CreateSpacePage.deps'

export const createCreateSpacePageDeps = (client: ApiClient): CreateSpacePageDeps => ({
  create: (input) => request(client.POST('/api/spaces', { body: input, parseAs: 'text' })),
})
