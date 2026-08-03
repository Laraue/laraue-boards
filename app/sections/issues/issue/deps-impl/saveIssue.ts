import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { updateIssueFormData } from '~/sections/issues/shared/api/issueFormData'

import type { SaveIssue } from '../IssuePage.deps'

// ponytail: the status API returns no body; remove this derivation when it returns the new key.
const moveIssueKey = (issueKey: string, spaceKey: string) =>
  `${spaceKey}-${issueKey.slice(issueKey.lastIndexOf('-') + 1)}`

export const createSaveIssue =
  (client: ApiClient): SaveIssue =>
  async (input) => {
    const response = await tryRequest(() =>
      client.PUT('/api/issues/{key}', {
        body: {},
        bodySerializer: () =>
          updateIssueFormData({
            ...input,
            attributeValues: mapIssueAttributeValues(input.attributeValues),
          }),
        params: { path: { key: input.issueKey } },
      }),
    )
    if (!response) {
      return { code: 0, status: 'error' }
    }
    if (!('data' in response)) {
      return response.response.status === 400
        ? { message: getInvalidInputError(response.error).message, status: 'validation-error' }
        : { code: response.response.status, status: 'error' }
    }
    const saved = {
      boardId: input.boardId,
      complete: true,
      content: input.content,
      issueKey: input.issueKey,
      previousBoardId: input.previousBoardId,
      previousIssueKey: input.issueKey,
      previousStatusId: input.previousStatusId,
      spaceKey: input.previousSpaceKey,
      statusId: input.statusId,
    }
    if (input.statusId === input.previousStatusId) {
      return { data: saved, status: 'success' }
    }
    const moveResponse = await tryRequest(() =>
      client.POST('/api/issues/status', {
        body: { issueKeys: [input.issueKey], statusId: Number(input.statusId) },
      }),
    )
    if (moveResponse && 'data' in moveResponse) {
      return {
        data: {
          ...saved,
          issueKey:
            input.spaceKey === input.previousSpaceKey
              ? input.issueKey
              : moveIssueKey(input.issueKey, input.spaceKey),
          spaceKey: input.spaceKey,
        },
        status: 'success',
      }
    }
    return {
      data: {
        ...saved,
        boardId: input.previousBoardId,
        complete: false,
        statusId: input.previousStatusId,
      },
      status: 'success',
    }
  }
