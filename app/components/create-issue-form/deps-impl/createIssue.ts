import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { createIssueFormData } from '~/sections/issues/shared/api/issueFormData'

import type { CreateIssue } from '../CreateIssueForm.deps'

export const createCreateIssue =
  (client: ApiClient): CreateIssue =>
  (input) =>
    executeAction({
      map: (issueKey) => (issueKey === undefined ? undefined : { issueKey: String(issueKey) }),
      request: () =>
        client.POST('/api/issues', {
          body: {},
          bodySerializer: () =>
            createIssueFormData({
              ...input,
              attributeValues: mapIssueAttributeValues(input.attributeValues),
            }),
          parseAs: 'text',
        }),
    })
