import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { COLORS } from '~/constants/colors'

import type { ViewDataMovement } from '../DataMovementPage.deps'
import type { DataMovementPageData } from '../DataMovementPage.types'

type Schemas = components['schemas']

const mapPage = (
  current: { id: number | string; name: string },
  spaces: Schemas['SpaceListDto'][],
  boardsBySpace: Schemas['EpicListDto'][][],
): DataMovementPageData => ({
  currentOrganizationId: String(current.id),
  currentOrganizationName: current.name,
  spaces: spaces.map((space, index) => ({
    boards: boardsBySpace[index]!.filter((board) => !board.isDefault).map((board) => ({
      color: board.color ?? COLORS.gray,
      id: String(board.id),
      name: board.name,
    })),
    color: space.color,
    isDefault: space.isDefault,
    key: space.key,
    name: space.name,
  })),
})

export const createViewDataMovement =
  (client: ApiClient): ViewDataMovement =>
  async ({ signal }) => {
    const current = await tryRequest(() => client.GET('/api/organizations/current', { signal }))
    if (!current) {
      return { code: 0, status: 'error' }
    }
    if ('error' in current) {
      // treat "current organization not found" the same as access denied
      return {
        code: current.response.status === 404 ? 403 : current.response.status,
        status: 'error',
      }
    }
    if (!current.data.canMassMove) {
      return { code: 403, status: 'error' }
    }

    const spaces = await tryRequest(() => client.GET('/api/spaces', { signal }))
    if (!spaces) {
      return { code: 0, status: 'error' }
    }
    if ('error' in spaces) {
      return { code: spaces.response.status, status: 'error' }
    }

    const boardResponses = await tryRequest(() =>
      Promise.all(
        spaces.data.map((space) =>
          client.GET('/api/spaces/{key}/epics', {
            params: { path: { key: space.key } },
            signal,
          }),
        ),
      ),
    )
    if (!boardResponses) {
      return { code: 0, status: 'error' }
    }
    for (const response of boardResponses) {
      if ('error' in response) {
        return { code: response.response.status, status: 'error' }
      }
    }
    const boardsBySpace = boardResponses.map((response) => {
      if ('error' in response) {
        throw new Error('Unreachable boards response')
      }
      return response.data
    })

    return {
      data: mapPage(current.data, spaces.data, boardsBySpace),
      status: 'success',
    }
  }
