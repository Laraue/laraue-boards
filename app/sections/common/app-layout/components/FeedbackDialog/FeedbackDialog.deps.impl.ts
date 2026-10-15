import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'

import type { FeedbackDialogDeps } from './FeedbackDialog.deps'
import type { FeedbackType } from './FeedbackDialog.types'

// The feedback service rejects a context value longer than this; a long page URL is cut instead.
const MAX_CONTEXT_VALUE_LENGTH = 2048

const toApiType: Record<FeedbackType, components['schemas']['FeedbackType']> = {
  bug: 'Bug',
  idea: 'Idea',
  question: 'Question',
}

export const createFeedbackDialogDeps = (client: ApiClient): FeedbackDialogDeps => ({
  // The backend adds the user and the current organization.
  send: async ({ browser, contact, locale, message, page, type }) => {
    const preferredContact = contact.trim()
    await request(
      client.POST('/api/feedback', {
        body: {
          context: {
            browser: browser.slice(0, MAX_CONTEXT_VALUE_LENGTH),
            // Left out when empty: the team then answers through the account the user signed in with.
            ...(preferredContact ? { contact: preferredContact } : {}),
            locale,
            page: page.slice(0, MAX_CONTEXT_VALUE_LENGTH),
          },
          message: message.trim(),
          type: toApiType[type],
        },
      }),
    )
  },
})
