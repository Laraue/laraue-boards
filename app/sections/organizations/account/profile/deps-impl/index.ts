import type { ApiClient } from '#infrastructure/api/client'

import type { MemberProfilePageDeps } from '../MemberProfilePage.deps'
import { createUpdateMemberProfile } from './updateMemberProfile'
import { createViewMemberProfile } from './viewMemberProfile'

export const createMemberProfilePageDeps = (client: ApiClient): MemberProfilePageDeps => ({
  update: createUpdateMemberProfile(client),
  view: createViewMemberProfile(client),
})
