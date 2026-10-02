import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { createOrganizationSelectDeps } from '~/components/organization-select/OrganizationSelect.deps.impl'

import type { MoveSpacesDialogDeps } from './MoveSpacesDialog.deps'

export const createMoveSpacesDialogDeps = (client: ApiClient): MoveSpacesDialogDeps => ({
  moveSpaces: async ({ destinationOrganizationId, spaceKeys }) => {
    if (!destinationOrganizationId || !spaceKeys.length) {
      throw new ApiError(400)
    }
    await Promise.all(
      spaceKeys.map((spaceKey) =>
        request(
          client.POST('/api/movement/space/{key}/to-organization/{organizationId}', {
            params: {
              path: { key: spaceKey, organizationId: Number(destinationOrganizationId) },
            },
          }),
        ),
      ),
    )
  },
  organizationSelect: createOrganizationSelectDeps(client),
})
