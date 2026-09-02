import type { RetroApiClient } from '#infrastructure/api/client'

import type { RetroListPageDeps } from '../RetroListPage.deps'
import { createRemoveRetro } from './removeRetro'
import { createStartRetro } from './startRetro'
import { createViewRetros } from './viewRetros'

export const createRetroListPageDeps = (client: RetroApiClient): RetroListPageDeps => ({
  removeRetro: createRemoveRetro(client),
  startRetro: createStartRetro(client),
  view: createViewRetros(client),
})
