import type { ApiClient } from '#infrastructure/api/client'

import type { StatusSelectDeps } from '../StatusSelect.deps'
import { createLoadStatuses } from './loadStatuses'

export const createStatusSelectDeps = (client: ApiClient): StatusSelectDeps => ({
  loadStatuses: createLoadStatuses(client),
})
