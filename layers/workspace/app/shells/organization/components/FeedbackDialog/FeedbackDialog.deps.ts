import type { FeedbackInput } from './FeedbackDialog.types'

export type FeedbackDialogDeps = {
  send: (input: FeedbackInput) => Promise<void>
}
