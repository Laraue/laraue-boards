// The backend's limits (AttachmentFileTypes), in its decimal megabytes: images 3 MB, documents 10 MB.
export const MAX_IMAGE_SIZE = 3_000_000
export const MAX_DOCUMENT_SIZE = 10_000_000

// The backend decides by the file's content; these only keep the picker and paste to what it accepts.
export const IMAGE_TYPES = {
  extensions: ['.gif', '.jpeg', '.jpg', '.png', '.webp'],
  mimeTypes: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
} as const

// Browsers often send no mime type for .md or .json, so documents go by extension.
export const DOCUMENT_EXTENSIONS = [
  '.doc',
  '.docx',
  '.json',
  '.markdown',
  '.md',
  '.pdf',
  '.txt',
] as const

export const ATTACHMENT_ACCEPT = [
  ...IMAGE_TYPES.mimeTypes,
  ...IMAGE_TYPES.extensions,
  ...DOCUMENT_EXTENSIONS,
].join(',')
