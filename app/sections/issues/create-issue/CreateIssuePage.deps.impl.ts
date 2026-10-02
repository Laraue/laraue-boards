import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createCreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps.impl'
import { mapIssueAttributes } from '~/sections/issues/shared/api/issueAttributes'

import type { CreateIssuePageDeps } from './CreateIssuePage.deps'

export const createCreateIssuePageDeps = (client: ApiClient): CreateIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: async ({ signal }) => {
    const attributes = await request(client.GET('/api/organizations/attributes', { signal }))
    return { attributes: mapIssueAttributes(attributes) }
  },
})
