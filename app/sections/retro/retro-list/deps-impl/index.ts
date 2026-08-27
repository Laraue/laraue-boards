import type { RetroApiClient } from '#infrastructure/api/client'

import type { RetroListPageDeps } from '../RetroListPage.deps'
import { createStartRetro } from './startRetro'
import { createViewRetros } from './viewRetros'

export const createRetroListPageDeps = (client: RetroApiClient): RetroListPageDeps => ({
  startRetro: createStartRetro(client),
  view: createViewRetros(client),
})
