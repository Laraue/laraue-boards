import type { ApiClient } from '#infrastructure/api/client'

import type { MemberPermissionsPageDeps } from '../MemberPermissionsPage.deps'
import { createUpdateMemberPermissions } from './updateMemberPermissions'
import { createViewMemberPermissions } from './viewMemberPermissions'

export const createMemberPermissionsPageDeps = (client: ApiClient): MemberPermissionsPageDeps => ({
  update: createUpdateMemberPermissions(client),
  view: createViewMemberPermissions(client),
})
