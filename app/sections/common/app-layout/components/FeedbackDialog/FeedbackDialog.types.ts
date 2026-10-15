export type FeedbackType = 'bug' | 'idea' | 'question'

/** What the user wrote, with where they were: the team sees `page` in its notification. */
export type FeedbackInput = {
  browser: string
  locale: string
  message: string
  page: string
  type: FeedbackType
}
