import type { RouteLocationRaw } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'

export type OrganizationRouteName = Extract<
  keyof RouteNamedMap,
  `organizations-organizationKey-${string}`
>

export const useOrganizationRoutes = () => {
  const route = useRoute<OrganizationRouteName>()
  const organizationKey = computed(() => {
    const value = route.params.organizationKey
    if (typeof value !== 'string') {
      throw new Error('organizationKey is missing or invalid')
    }
    return value
  })
  const organizationParams = () => ({
    organizationKey: organizationKey.value,
  })

  return {
    account: () =>
      ({
        name: 'organizations-organizationKey-account',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    accountTransactions: () =>
      ({
        name: 'organizations-organizationKey-account-transactions',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    admin: () =>
      ({
        name: 'organizations-organizationKey-admin',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    adminTransactions: () =>
      ({
        name: 'organizations-organizationKey-admin-transactions',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    apiKeys: () =>
      ({
        name: 'organizations-organizationKey-account-api-keys',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    attribute: (id: string) =>
      ({
        name: 'organizations-organizationKey-admin-attributes-id',
        params: { ...organizationParams(), id },
      }) satisfies RouteLocationRaw,
    attributes: () =>
      ({
        name: 'organizations-organizationKey-admin-attributes',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    backlog: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-backlog',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    board: (spaceKey: string, boardId: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boardId',
        params: { ...organizationParams(), boardId, spaceKey },
      }) satisfies RouteLocationRaw,
    boardSettings: (spaceKey: string, boardId: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boardId-settings',
        params: { ...organizationParams(), boardId, spaceKey },
      }) satisfies RouteLocationRaw,
    connectedAccounts: () =>
      ({
        name: 'organizations-organizationKey-account-connected-accounts',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    dataMovement: () =>
      ({
        name: 'organizations-organizationKey-admin-data-movement',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    history: () =>
      ({
        name: 'organizations-organizationKey-history',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    issue: (issueKey: string) =>
      ({
        name: 'organizations-organizationKey-issues-issueKey',
        params: { ...organizationParams(), issueKey },
      }) satisfies RouteLocationRaw,
    issues: () =>
      ({
        name: 'organizations-organizationKey-issues',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    memberPermissions: (id: string) =>
      ({
        name: 'organizations-organizationKey-admin-permissions-id',
        params: { ...organizationParams(), id },
      }) satisfies RouteLocationRaw,
    newAttribute: () =>
      ({
        name: 'organizations-organizationKey-admin-attributes-new',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    newBacklogIssue: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-backlog-issues-new',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    newBoard: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boards-new',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    newBoardIssue: (spaceKey: string, boardId: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boardId-issues-new',
        params: { ...organizationParams(), boardId, spaceKey },
      }) satisfies RouteLocationRaw,
    newIssue: () =>
      ({
        name: 'organizations-organizationKey-issues-new',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    newSpace: () =>
      ({
        name: 'organizations-organizationKey-spaces-new',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    organizationKey,
    permissions: () =>
      ({
        name: 'organizations-organizationKey-admin-permissions',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    retro: (retroId: string) =>
      ({
        name: 'organizations-organizationKey-retro-retroId',
        params: { ...organizationParams(), retroId },
      }) satisfies RouteLocationRaw,
    retros: () =>
      ({
        name: 'organizations-organizationKey-retro',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    space: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    spaceSettings: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-settings',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
  }
}
