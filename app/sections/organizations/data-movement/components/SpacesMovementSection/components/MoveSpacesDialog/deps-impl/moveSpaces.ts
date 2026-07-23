import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { MoveSpaces } from '../MoveSpacesDialog.deps'

export const createMoveSpaces =
  (client: ApiClient): MoveSpaces =>
  async ({ destinationOrganizationId, spaceIds }) => {
    if (!destinationOrganizationId || !spaceIds.length) {
      return { code: 400, status: 'error' }
    }
    const responses = await tryRequest(() =>
      Promise.all(
        spaceIds.map((spaceId) =>
          client.POST('/api/movement/space/{id}/to-organization/{organizationId}', {
            params: {
              path: { id: Number(spaceId), organizationId: Number(destinationOrganizationId) },
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
