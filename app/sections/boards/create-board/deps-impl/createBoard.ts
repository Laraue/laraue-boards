import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'

import type { CreateBoard } from '../CreateBoardPage.deps'

export const createCreateBoard =
  (client: ApiClient): CreateBoard =>
  async (input) => {
    const spaces = await tryRequest(() => client.GET('/api/spaces'))
    if (!spaces || !('data' in spaces) || spaces.data === undefined) {
      return { code: spaces && 'error' in spaces ? spaces.response.status : 0, status: 'error' }
    }

    const space = findSpaceByKey(spaces.data, input.spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }

    const response = await tryRequest(() =>
      client.POST('/api/epics', {
        body: { color: input.color, name: input.name, spaceId: space.id },
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
