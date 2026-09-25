import type { ApiClient } from '#infrastructure/api/client'
import type { AppPreferences } from '~/composables/useAppPreferences'

import type { AppLayoutDeps } from '../AppLayout.deps'
import { createAppLayoutTourDeps } from './appLayoutTour'
import { createLogout } from './logout'
import { createViewAppLayout } from './viewAppLayout'

export const createAppLayoutDeps = (
  client: ApiClient,
  preferences: AppPreferences,
): AppLayoutDeps => ({
  logout: createLogout(client),
  preferences,
  tour: createAppLayoutTourDeps(client),
  view: createViewAppLayout(client),
})
