import type { ApiClient } from '#infrastructure/api/client'

import type { ProfileSectionDeps } from '../ProfileSection.deps'
import { createUpdateGlobalProfile } from './updateGlobalProfile'
import { createViewGlobalProfile } from './viewGlobalProfile'

export const createProfileSectionDeps = (client: ApiClient): ProfileSectionDeps => ({
  update: createUpdateGlobalProfile(client),
  view: createViewGlobalProfile(client),
})
