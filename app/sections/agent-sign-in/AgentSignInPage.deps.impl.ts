import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'

import type { AgentSignInAnswer, AgentSignInPageDeps } from './AgentSignInPage.deps'

// The sign-in is gone (timed out, or answered meanwhile) - the page asks to start again rather than failing.
const answerOrExpired = async (answer: Promise<unknown>): Promise<AgentSignInAnswer> => {
  try {
    await answer
    return 'answered'
  } catch (error) {
    if (isApiError(error, 404)) {
      return 'expired'
    }
    throw error
  }
}

export const createAgentSignInPageDeps = (client: ApiClient): AgentSignInPageDeps => ({
  approve: ({ code, organizationId }) =>
    answerOrExpired(
      request(
        client.POST('/api/agent-sign-in/{userCode}/approve', {
          body: { organizationId: Number(organizationId) },
          params: { path: { userCode: code } },
          parseAs: 'text',
        }),
      ),
    ),

  deny: ({ code }) =>
    answerOrExpired(
      request(
        client.POST('/api/agent-sign-in/{userCode}/deny', {
          params: { path: { userCode: code } },
          parseAs: 'text',
        }),
      ),
    ),

  view: async ({ code, signal }) => {
    try {
      const [signIn, organizations] = await Promise.all([
        request(
          client.GET('/api/agent-sign-in/{userCode}', {
            params: { path: { userCode: code } },
            signal,
          }),
        ),
        request(client.GET('/api/organizations', { signal })),
      ])

      return {
        organizations: organizations.map((organization) => ({
          id: String(organization.id),
          name: organization.name,
        })),
        signIn: {
          clientName: signIn.clientName,
          keyName: signIn.keyName,
          machineName: signIn.machineName,
          userCode: signIn.userCode,
        },
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
