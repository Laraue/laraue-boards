import type { ApiClient } from '#infrastructure/api/client'
import { createCreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps.impl'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { CreateIssuePageDeps } from './CreateIssuePage.deps'

export const createCreateIssuePageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): CreateIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  // The attributes come from the layout, so the page asks the API nothing.
  view: async () => ({ attributes: readCatalog().attributes }),
})
