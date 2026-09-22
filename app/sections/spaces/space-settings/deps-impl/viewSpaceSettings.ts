import type { ApiClient } from '#infrastructure/api/client'
import { isErrorResponse, tryRequest } from '#infrastructure/api/tryRequest'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'

import type { ViewSpaceSettings } from '../SpaceSettingsPage.deps'

export const createViewSpaceSettings =
  (client: ApiClient): ViewSpaceSettings =>
  async ({ signal, spaceKey }) => {
    const spaces = await tryRequest(() => client.GET('/api/spaces', { signal }))
    if (!spaces) {
      return { code: 0, status: 'error' }
    }
    if (isErrorResponse(spaces)) {
      return { code: spaces.response.status, status: 'error' }
    }
    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }
    const details = await tryRequest(() =>
      client.GET('/api/spaces/{key}', {
        params: { path: { key: spaceKey } },
        signal,
      }),
    )
    if (!details) {
      return { code: 0, status: 'error' }
    }
    if (isErrorResponse(details)) {
      return { code: details.response.status, status: 'error' }
    }
    return {
      data: {
        canDelete: details.data.canDelete,
        canUpdate: details.data.canUpdate,
        color: space.color,
        name: space.name,
        spaceKey,
      },
      status: 'success',
    }
  }
