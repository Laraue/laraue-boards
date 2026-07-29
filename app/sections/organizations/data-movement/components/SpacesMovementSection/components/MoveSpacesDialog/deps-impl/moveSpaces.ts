import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { MoveSpaces } from '../MoveSpacesDialog.deps'

export const createMoveSpaces =
  (client: ApiClient): MoveSpaces =>
  async ({ destinationOrganizationId, spaceKeys }) => {
    if (!destinationOrganizationId || !spaceKeys.length) {
      return { code: 400, status: 'error' }
    }
    const responses = await tryRequest(() =>
      Promise.all(
        spaceKeys.map((spaceKey) =>
          client.POST('/api/movement/space/{key}/to-organization/{organizationId}', {
            params: {
              path: { key: spaceKey, organizationId: Number(destinationOrganizationId) },
            },
          }),
        ),
      ),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    for (const response of responses) {
      if ('error' in response) {
        return { code: response.response.status, status: 'error' }
      }
    }
    return { data: true, status: 'success' }
  }
