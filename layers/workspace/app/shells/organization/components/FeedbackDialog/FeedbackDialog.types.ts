export type FeedbackType = 'bug' | 'idea' | 'question'

/** What the user wrote, with where they were: the team sees `page` in its notification. */
export type FeedbackInput = {
  browser: string
  // How to reach the user when not through the account they signed in with; empty when that is fine.
  contact: string
  locale: string
  message: string
  page: string
  type: FeedbackType
}
