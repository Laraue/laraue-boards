import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { SetupSpaceDialogDeps } from './SetupSpaceDialog.deps'

export const createSetupSpaceDialogDeps = (client: ApiClient): SetupSpaceDialogDeps => ({
  renameSpace: async ({ color, key, name, newKey }) => {
    await request(
      client.PUT('/api/spaces/{key}', {
        body: { color, name, newKey },
        params: { path: { key } },
      }),
    )
  },
})
