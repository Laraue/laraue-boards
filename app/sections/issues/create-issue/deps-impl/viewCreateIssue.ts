import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { mapIssueAttributes } from '~/sections/issues/shared/api/issueAttributes'

import type { ViewCreateIssue } from '../CreateIssuePage.deps'

export const createViewCreateIssue =
  (client: ApiClient): ViewCreateIssue =>
  ({ signal }) =>
    executeQuery({
      map: (attributes) =>
        attributes === undefined ? undefined : { attributes: mapIssueAttributes(attributes) },
      request: () => client.GET('/api/organizations/attributes', { signal }),
    })
