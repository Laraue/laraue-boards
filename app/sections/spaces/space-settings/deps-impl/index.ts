import type { ApiClient } from '#infrastructure/api/client'

import type { SpaceSettingsPageDeps } from '../SpaceSettingsPage.deps'
import { createRemoveSpace } from './removeSpace'
import { createUpdateSpace } from './updateSpace'
import { createViewSpaceSettings } from './viewSpaceSettings'

export const createSpaceSettingsPageDeps = (client: ApiClient): SpaceSettingsPageDeps => ({
  remove: createRemoveSpace(client),
  update: createUpdateSpace(client),
  view: createViewSpaceSettings(client),
})
