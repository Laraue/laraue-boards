import type { ApiClient } from '#infrastructure/api/client'

import type { SpacePageDeps } from '../SpacePage.deps'
import { createViewSpace } from './viewSpace'

export const createSpacePageDeps = (client: ApiClient): SpacePageDeps => ({
  view: createViewSpace(client),
})
