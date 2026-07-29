import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { COLORS } from '~/constants/colors'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'

import type { ViewSpace } from '../SpacePage.deps'
import type { SpacePageData } from '../SpacePage.types'

type Schemas = components['schemas']

const mapPage = (
  spaceId: string,
  space: Schemas['SpaceListDto'],
  details: Schemas['SpaceDetailsDto'],
  boards: Schemas['EpicSummary'][],
): SpacePageData => ({
  boards: boards.map((board) => ({
    color: board.color ?? (board.isDefault ? space.color : COLORS.gray),
    id: String(board.id),
    issueCount: board.columns.reduce((sum, column) => sum + Number(column.count), 0),
    kind: board.isDefault ? 'backlog' : 'board',
    name: board.isDefault ? 'Backlog' : board.name,
    statuses: board.columns.map((column) => ({
      color: column.color ?? COLORS.gray,
      count: Number(column.count),
      name: column.name,
    })),
  })),
  canCreateBoards: details.canCreateEpics,
  canManage: details.canUpdate || details.canDelete,
  color: space.color,
  id: spaceId,
  key: space.key,
  name: space.name,
})

export const createViewSpace =
  (client: ApiClient): ViewSpace =>
  async ({ signal, spaceKey }) => {
    const spaces = await tryRequest(() => client.GET('/api/spaces', { signal }))
    if (!spaces || 'error' in spaces) {
      return { code: spaces?.response.status ?? 0, status: 'error' }
    }
    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/spaces/{key}', {
          params: { path: { key: spaceKey } },
          signal,
        }),
        client.GET('/api/issues/summary', {
          params: { query: { SpaceKey: spaceKey } },
          signal,
        }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    const [details, boards] = responses
    if ('error' in details) {
      return { code: details.response.status, status: 'error' }
    }
    if ('error' in boards) {
      return { code: boards.response.status, status: 'error' }
    }
    return { data: mapPage(spaceKey, space, details.data, boards.data), status: 'success' }
  }
