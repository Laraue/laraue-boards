import type { ApiClient } from '#infrastructure/api/client'

import type { CreateSpacePageDeps } from '../CreateSpacePage.deps'
import { createCreateSpace } from './createSpace'

export const createCreateSpacePageDeps = (client: ApiClient): CreateSpacePageDeps => ({
  create: createCreateSpace(client),
})
