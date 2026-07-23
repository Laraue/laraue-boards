import type { ApiClient } from '#infrastructure/api/client'

import type { AppLayoutDeps } from '../AppLayout.deps'
import { createLogout } from './logout'
import { createViewAppLayout } from './viewAppLayout'

export const createAppLayoutDeps = (client: ApiClient): AppLayoutDeps => ({
  logout: createLogout(client),
  view: createViewAppLayout(client),
})
