// A document has no preview: it's shown as a file and only downloaded (the server serves it as an attachment).
export type IssueAttachmentViewModel =
  | {
      id: string
      kind: 'image'
      originalUrl: string
      previewUrl: string
    }
  | {
      fileName: string
      fileSize?: number
      id: string
      kind: 'document'
      url: string
    }
