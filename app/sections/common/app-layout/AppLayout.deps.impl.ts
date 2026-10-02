import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'
import { DEFAULT_COLOR } from '~/constants/colors'
import { getOrganizationKey } from '~/utils/organizationKey'

import type { AppLayoutDeps, AppLayoutProblem, AppLayoutResult } from './AppLayout.deps'

const ONBOARDING_ID = 'AppLayoutV1'

const toProblem = (status: number): AppLayoutProblem => {
  if (status === 401) {
    return { kind: 'signed-out' }
  }
  if (status === 403) {
    return { kind: 'no-access' }
  }
  return { code: status, kind: 'load-failed' }
}

const loadAppLayout = async (
  client: ApiClient,
  organizationKey: string,
  signal: AbortSignal | undefined,
): Promise<AppLayoutResult> => {
  const [current, organizations] = await Promise.all([
    // No organization selected yet (401/404) is settled below by selecting the one in the url.
    request(client.GET('/api/organizations/current', { signal })).catch((error: unknown) => {
      if (isApiError(error, 401) || isApiError(error, 404)) {
        return undefined
      }
      throw error
    }),
    request(client.GET('/api/organizations', { signal })),
  ])
  const membership = organizations.find((item) => getOrganizationKey(item) === organizationKey)
  if (!membership) {
    return { problem: { kind: 'unknown-organization' }, status: 'problem' }
  }

  let organization = current
  if (!organization || String(organization.id) !== String(membership.id)) {
    // The organization cookie is set by the browser, so the server only reports the switch.
    if (import.meta.server) {
      return { problem: { kind: 'selecting-organization' }, status: 'problem' }
    }
    await request(
      client.POST('/api/organizations/login', {
        body: { organizationId: membership.id },
        parseAs: 'text',
      }),
    )
    organization = await request(client.GET('/api/organizations/current', { signal }))
    if (String(organization.id) !== String(membership.id)) {
      return { problem: { kind: 'unknown-organization' }, status: 'problem' }
    }
  }

  const [spaces, tariff] = await Promise.all([
    request(client.GET('/api/spaces', { signal })),
    request(client.GET('/api/billing/tariff', { signal })),
  ])
  return {
    data: {
      organization: {
        canCreateSpaces: organization.canCreateSpaces,
        canManage: organization.canManage,
        canManageAttributes: organization.canManageAttributes,
        canMassMove: organization.canMassMove,
        canUpdate: membership.canUpdate,
        canViewBilling: organization.canViewBilling,
        color: organization.color ?? DEFAULT_COLOR,
        id: String(organization.id),
        initial: organization.name[0] ?? '?',
        name: organization.name,
      },
      spaces: spaces.map((space) => ({ color: space.color, key: space.key, name: space.name })),
      // How the user is shown in this organization.
      user: {
        color: organization.memberProfile.color,
        initials: organization.memberProfile.initials,
        name: organization.memberProfile.displayName,
        tariffName: tariff.name,
      },
    },
    status: 'success',
  }
}

export const createAppLayoutDeps = (client: ApiClient): AppLayoutDeps => ({
  logout: async () => {
    await request(client.POST('/api/user/logout')).catch(() => undefined)
  },

  // The tour is optional: a failure to load or save its state never reaches the layout.
  tour: {
    loadStatus: async () => {
      const onboarding = await request(
        client.GET('/api/user/onboarding/{onboardingId}', {
          params: { path: { onboardingId: ONBOARDING_ID } },
        }),
      ).catch(() => undefined)
      const status = onboarding?.status
      return status === 'Completed' ? 'completed' : status === 'Dismissed' ? 'dismissed' : undefined
    },
    saveStatus: async (status) => {
      await request(
        client.PUT('/api/user/onboarding/{onboardingId}', {
          body: { status: status === 'completed' ? 'Completed' : 'Dismissed' },
          params: { path: { onboardingId: ONBOARDING_ID } },
        }),
      ).catch(() => undefined)
    },
  },

  // Every failure is a problem the layout routes to: sign in, no access or a failed load.
  view: async ({ organizationKey, signal }) => {
    try {
      return await loadAppLayout(client, organizationKey, signal)
    } catch (error) {
      if (!isApiError(error)) {
        throw error
      }
      return { problem: toProblem(error.status), status: 'problem' }
    }
  },
})
