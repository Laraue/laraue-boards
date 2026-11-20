import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'

import type { OAuthConsentAnswer, OAuthConsentPageDeps } from './OAuthConsentPage.deps'

// The request is gone (timed out, or answered meanwhile) - the page asks to start again rather than failing.
const answerOrExpired = async (
  answer: Promise<{ redirectUrl: string }>,
): Promise<OAuthConsentAnswer> => {
  try {
    const { redirectUrl } = await answer
    return { redirectUrl, status: 'answered' }
  } catch (error) {
    if (isApiError(error, 404)) {
      return { status: 'expired' }
    }
    throw error
  }
}

export const createOAuthConsentPageDeps = (client: ApiClient): OAuthConsentPageDeps => ({
  approve: ({ organizationId, requestId }) =>
    answerOrExpired(
      request(
        client.POST('/api/oauth/requests/{requestId}/approve', {
          body: { organizationId: Number(organizationId) },
          params: { path: { requestId } },
        }),
      ),
    ),

  deny: ({ requestId }) =>
    answerOrExpired(
      request(
        client.POST('/api/oauth/requests/{requestId}/deny', {
          params: { path: { requestId } },
        }),
      ),
    ),

  view: async ({ requestId, signal }) => {
    try {
      const [consent, organizations] = await Promise.all([
        request(
          client.GET('/api/oauth/requests/{requestId}', {
            params: { path: { requestId } },
            signal,
          }),
        ),
        request(client.GET('/api/organizations', { signal })),
      ])

      return {
        consent: {
          clientHost: consent.clientHost,
          clientName: consent.clientName,
          keyName: consent.keyName,
        },
        organizations: organizations.map((organization) => ({
          id: String(organization.id),
          name: organization.name,
        })),
        status: 'ready',
      }
    } catch (error) {
      if (isApiError(error, 401)) {
        return { status: 'sign-in-required' }
      }
      if (isApiError(error, 404)) {
        return { status: 'not-found' }
      }
      throw error
    }
  },
})
