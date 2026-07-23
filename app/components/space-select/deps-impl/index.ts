import type { ApiClient } from '#infrastructure/api/client'

import type { SpaceSelectDeps } from '../SpaceSelect.deps'
import { createLoadSpaces } from './loadSpaces'

export const createSpaceSelectDeps = (client: ApiClient): SpaceSelectDeps => ({
  loadSpaces: createLoadSpaces(client),
})
