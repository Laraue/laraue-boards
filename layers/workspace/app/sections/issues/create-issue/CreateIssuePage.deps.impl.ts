import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { mapIssueAttributes } from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { createCreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps.impl'

import type { CreateIssuePageDeps } from './CreateIssuePage.deps'

export const createCreateIssuePageDeps = (client: ApiClient): CreateIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: async ({ signal }) => {
    const attributes = await request(client.GET('/api/organizations/attributes', { signal }))
    return { attributes: mapIssueAttributes(attributes) }
  },
})
