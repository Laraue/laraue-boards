import type { ApiClient } from '#infrastructure/api/client'

import type { CreateAttributePageDeps } from '../CreateAttributePage.deps'
import { createCreateAttribute } from './createAttribute'

export const createCreateAttributePageDeps = (client: ApiClient): CreateAttributePageDeps => ({
  create: createCreateAttribute(client),
})
