import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { DEFAULT_COLOR } from '~/constants/colors'
import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'
import { getOrganizationKey } from '~/utils/organizationKey'

import type { AppLayoutProblem, ViewAppLayout } from '../AppLayout.deps'

type Schemas = components['schemas']

const failed = (attempt?: { response: Response }): AppLayoutProblem => ({
  code: attempt?.response.status ?? 0,
  kind: 'load-failed',
})

const toProblem = (status: number): AppLayoutProblem => {
  if (status === 401) {
    return { kind: 'signed-out' }
  }
  if (status === 403) {
    return { kind: 'no-access' }
  }
  return { code: status, kind: 'load-failed' }
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
      return { problem: failed(), status: 'problem' }
    }
    let [organization, organizations] = initial
    if ('error' in organizations) {
      return { problem: toProblem(organizations.response.status), status: 'problem' }
    }
    const organizationMembership = organizations.data.find(
      (item) => getOrganizationKey(item) === organizationKey,
    )
    if (!organizationMembership) {
      return { problem: { kind: 'unknown-organization' }, status: 'problem' }
    }

    if (
      'error' in organization ||
      String(organization.data.id) !== String(organizationMembership.id)
    ) {
      const noOrganizationSelected =
        'error' in organization &&
        (organization.response.status === 401 || organization.response.status === 404)

      if ('error' in organization && !noOrganizationSelected) {
        return { problem: toProblem(organization.response.status), status: 'problem' }
      }
      if (import.meta.server) {
        return { problem: { kind: 'selecting-organization' }, status: 'problem' }
      }
      const selection = await tryRequest(() =>
        client.POST('/api/organizations/login', {
          body: { organizationId: organizationMembership.id },
          parseAs: 'text',
        }),
      )
      if (!selection || 'error' in selection) {
        return { problem: failed(selection), status: 'problem' }
      }
      const refreshed = await tryRequest(() => client.GET('/api/organizations/current', { signal }))
      if (!refreshed || 'error' in refreshed) {
        return { problem: failed(refreshed), status: 'problem' }
      }
      organization = refreshed
    }

    if (
      'error' in organization ||
      String(organization.data.id) !== String(organizationMembership.id)
    ) {
      return { problem: { kind: 'unknown-organization' }, status: 'problem' }
    }

    const details = await tryRequest(() =>
      Promise.all([client.GET('/api/user', { signal }), client.GET('/api/spaces', { signal })]),
    )
    if (!details) {
      return { problem: failed(), status: 'problem' }
    }
    const [user, spaces] = details
    if ('error' in user) {
      return { problem: toProblem(user.response.status), status: 'problem' }
    }
    if ('error' in spaces) {
      return { problem: toProblem(spaces.response.status), status: 'problem' }
    }
    return {
      data: mapAppLayoutData(organization.data, organizationMembership, spaces.data, user.data),
      status: 'success',
    }
  }
