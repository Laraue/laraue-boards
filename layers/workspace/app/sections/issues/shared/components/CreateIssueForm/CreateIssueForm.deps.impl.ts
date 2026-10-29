import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createBoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps.impl'
import { createStatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps.impl'
import { mapIssueAttributeValues } from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { createIssueFormData } from '#layers/workspace/app/sections/issues/shared/api/issueFormData'
import { createAssigneeSelectDeps } from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.deps.impl'
import { createIssueDescriptionDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueDescription/IssueDescription.deps.impl'
import { createSpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps.impl'

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
