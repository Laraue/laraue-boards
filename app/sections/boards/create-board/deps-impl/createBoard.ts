import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { CreateBoard } from '../CreateBoardPage.deps'

export const createCreateBoard =
  (client: ApiClient): CreateBoard =>
  async (input) => {
    const response = await tryRequest(() =>
      client.POST('/api/epics', {
        body: {
          color: input.color,
          name: input.name,
          spaceKey: input.spaceKey,
          statuses: input.statuses,
        },
        parseAs: 'text',
      }),
    )
    if (!response) {
      return { code: 0, status: 'error' }
    }
    if ('data' in response) {
      return { data: { boardId: String(response.data) }, status: 'success' }
    }
    if (response.response.status === 400) {
      return { message: getInvalidInputError(response.error).message, status: 'validation-error' }
    }
    return { code: response.response.status, status: 'error' }
  }
