import type { ApiClient } from '#infrastructure/api/client'

import type { AssigneeSelectDeps } from '../AssigneeSelect.deps'
import { createLoadAssignees } from './loadAssignees'

export const createAssigneeSelectDeps = (client: ApiClient): AssigneeSelectDeps => ({
  loadAssignees: createLoadAssignees(client),
})
