import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createAssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps.impl'
import { createBoardSelectDeps } from '~/components/board-select/BoardSelect.deps.impl'
import { createSpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps.impl'
import { createStatusSelectDeps } from '~/components/status-select/StatusSelect.deps.impl'
import { createIssueDescriptionDeps } from '~/sections/issues/issue/components/IssueDescription/deps-impl'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { createIssueFormData } from '~/sections/issues/shared/api/issueFormData'

import type { CreateIssueFormDeps } from './CreateIssueForm.deps'

export const createCreateIssueFormDeps = (client: ApiClient): CreateIssueFormDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),

  // Sent as a form, so the attached files go with it.
  create: (input) =>
    request(
      client.POST('/api/issues', {
        body: {},
        bodySerializer: () =>
          createIssueFormData({
            ...input,
            attributeValues: mapIssueAttributeValues(input.attributeValues),
          }),
        parseAs: 'text',
      }),
    ),

  description: createIssueDescriptionDeps(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})
