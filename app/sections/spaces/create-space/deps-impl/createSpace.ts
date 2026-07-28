import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { CreateSpace } from '../CreateSpacePage.deps'

export const createCreateSpace =
  (client: ApiClient): CreateSpace =>
  (input) =>
    executeAction({
      map: (spaceKey) => (spaceKey ? { spaceKey } : undefined),
      request: () => client.POST('/api/spaces', { body: input, parseAs: 'text' }),
    })
