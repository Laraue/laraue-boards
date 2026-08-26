import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { DEFAULT_COLOR } from '~/constants/colors'
import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'
import { getOrganizationKey } from '~/utils/organizationKey'

import type { ViewAppLayout } from '../AppLayout.deps'

type Schemas = components['schemas']

const getErrorCode = (status: number, context: string): number => {
  if (status === 401 || status === 403) {
    return status
  }
  if (status === 404) {
    return 404
  }
  if (status >= 500) {
    return status
  }
  throw new Error(`Unrecognized ${context} response: ${status}`)
}

const mapAppLayoutData = (
  organization: Schemas['OrganizationDto'],
  organizationMembership: Schemas['OrganizationListDto'],
  spaces: Schemas['SpaceListDto'][],
  user: Schemas['UserDto'],
): AppLayoutData => ({
  organization: {
    canCreateSpaces: organization.canCreateSpaces,
    canManage: organization.canManage,
    canManageAttributes: organization.canManageAttributes,
    canMassMove: organization.canMassMove,
    canUpdate: organizationMembership.canUpdate,
    color: organization.color ?? DEFAULT_COLOR,
    id: String(organization.id),
    initial: organization.name[0] ?? '?',
    name: organization.name,
  },
  spaces: spaces.map((space) => ({
    color: space.color,
    key: space.key,
    name: space.name,
  })),
  user: {
    color: user.color,
    initials: user.initials ?? '?',
    name:
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      user.initials ||
      'User',
  },
})

export const createViewAppLayout =
  (client: ApiClient): ViewAppLayout =>
  async ({ organizationKey, signal }) => {
    const initial = await tryRequest(() =>
      Promise.all([
        client.GET('/api/organizations/current', { signal }),
        client.GET('/api/organizations', { signal }),
      ]),
    )
    if (!initial) {
      return { code: 0, status: 'error' }
    }
    let [organization, organizations] = initial
    if ('error' in organizations) {
      return { code: getErrorCode(organizations.response.status, 'organizations'), status: 'error' }
    }
    const organizationMembership = organizations.data.find(
      (item) => getOrganizationKey(item) === organizationKey,
    )
    if (!organizationMembership) {
      return { code: 404, status: 'error' }
    }

    if (
      'error' in organization ||
      String(organization.data.id) !== String(organizationMembership.id)
    ) {
      if (!('error' in organization) && import.meta.server) {
        return { code: 409, status: 'error' }
      }
      // No organization cookie yet - `current` answers 401 though the user is signed in.
      const noOrganizationSelected =
        'error' in organization &&
        (organization.response.status === 401 || organization.response.status === 404)

      if ('error' in organization && !noOrganizationSelected) {
        return {
          code: getErrorCode(organization.response.status, 'current organization'),
          status: 'error',
        }
      }
      if (import.meta.server) {
        return { code: 409, status: 'error' }
      }
      const selection = await tryRequest(() =>
        client.POST('/api/organizations/login', {
          body: { organizationId: organizationMembership.id },
          parseAs: 'text',
        }),
      )
      if (!selection || 'error' in selection) {
        return {
          code: selection ? getErrorCode(selection.response.status, 'organization selection') : 0,
          status: 'error',
        }
      }
      const refreshed = await tryRequest(() => client.GET('/api/organizations/current', { signal }))
      if (!refreshed || 'error' in refreshed) {
        return {
          code: refreshed ? getErrorCode(refreshed.response.status, 'current organization') : 0,
          status: 'error',
        }
      }
      organization = refreshed
    }

    if (
      'error' in organization ||
      String(organization.data.id) !== String(organizationMembership.id)
    ) {
      return { code: 404, status: 'error' }
    }

    const details = await tryRequest(() =>
      Promise.all([client.GET('/api/user', { signal }), client.GET('/api/spaces', { signal })]),
    )
    if (!details) {
      return { code: 0, status: 'error' }
    }
    const [user, spaces] = details
    if ('error' in user) {
      return { code: getErrorCode(user.response.status, 'user'), status: 'error' }
    }
    if ('error' in spaces) {
      return { code: getErrorCode(spaces.response.status, 'spaces'), status: 'error' }
    }
    return {
      data: mapAppLayoutData(organization.data, organizationMembership, spaces.data, user.data),
      status: 'success',
    }
  }
