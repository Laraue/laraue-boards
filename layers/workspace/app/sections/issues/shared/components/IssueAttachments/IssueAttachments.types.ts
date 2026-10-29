// A document has no preview: it's shown as a file and only downloaded (the server serves it as an attachment).
export type IssueAttachmentViewModel =
  | {
      fileName: string
      fileSize?: number
      id: string
      kind: 'document'
      url: string
    }
  | {
      id: string
      kind: 'image'
      originalUrl: string
      previewUrl: string
    }
