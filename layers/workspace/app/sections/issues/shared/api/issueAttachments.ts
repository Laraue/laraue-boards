import type { components } from '#infrastructure/api/generated'
import type { IssueAttachmentViewModel } from '#layers/workspace/app/sections/issues/shared/components/IssueAttachments/IssueAttachments.types'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

const fileUrl = (id: string, baseUrl: string) =>
  new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href

// Videos aren't shown in the app yet.
export const mapIssueAttachments = (
  attachments: components['schemas']['AttachmentData'][],
  baseUrl: string,
): IssueAttachmentViewModel[] =>
  attachments.flatMap((attachment): IssueAttachmentViewModel[] => {
    switch (attachment.type) {
      case 'Image':
        return [
          {
            id: attachment.id,
            kind: 'image',
            originalUrl: fileUrl(attachment.originalFileId, baseUrl),
            previewUrl: fileUrl(attachment.previewFileId ?? attachment.originalFileId, baseUrl),
          },
        ]
      case 'Document':
        return [
          {
            fileName: attachment.fileName ?? '',
            ...(attachment.fileSize === null ? {} : { fileSize: Number(attachment.fileSize) }),
            id: attachment.id,
            kind: 'document',
            url: fileUrl(attachment.originalFileId, baseUrl),
          },
        ]
      case 'Video':
        return []
      default:
        return assertNever(attachment.type)
    }
  })
