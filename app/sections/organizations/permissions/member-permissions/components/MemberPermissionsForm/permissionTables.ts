import type {
  AdminPermissions,
  DirectSpacePermissions,
  GlobalPermissions,
  MemberPermissions,
  MemberPermissionsPageData,
} from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.types'

export type PermissionCell<Key extends string> = {
  checked: boolean
  disabled: boolean
  key: Key
  title: string | undefined
}

export type PermissionLabelKey = 'boards' | 'issues' | 'spaces'

export type PermissionRow<Key extends string> = {
  cells: Array<null | PermissionCell<Key>>
  label: PermissionLabelKey
}

export type DirectPermissionTable = {
  readInherited: boolean
  rows: Array<PermissionRow<keyof DirectSpacePermissions>>
}

export type AdminPermissionLabelKey =
  | 'deleteOrganization'
  | 'manageAttributes'
  | 'manageMembers'
  | 'moveData'
  | 'updateOrganization'

export const ADMIN_PERMISSION_OPTIONS: Array<{
  key: keyof AdminPermissions
  label: AdminPermissionLabelKey
}> = [
  { key: 'canManageMembers', label: 'manageMembers' },
  { key: 'canUpdateOrganization', label: 'updateOrganization' },
  { key: 'canDeleteOrganization', label: 'deleteOrganization' },
  { key: 'canMoveData', label: 'moveData' },
  { key: 'canManageAttributes', label: 'manageAttributes' },
]

export const PERMISSION_COLUMNS = ['Create', 'Update', 'Delete'] as const

const PERMISSION_DEFINITIONS: Array<{
  directKeys: Array<keyof DirectSpacePermissions | null>
  directLabel: PermissionLabelKey
  globalKeys: Array<keyof GlobalPermissions>
  globalLabel: PermissionLabelKey
}> = [
  {
    directKeys: [null, 'canUpdate', 'canDelete'],
    directLabel: 'spaces',
    globalKeys: ['canCreateSpaces', 'canUpdateSpaces', 'canDeleteSpaces'],
    globalLabel: 'spaces',
  },
  {
    directKeys: ['canCreateBoards', 'canUpdateBoards', 'canDeleteBoards'],
    directLabel: 'boards',
    globalKeys: ['canCreateBoards', 'canUpdateBoards', 'canDeleteBoards'],
    globalLabel: 'boards',
  },
  {
    directKeys: ['canCreateIssues', 'canUpdateIssues', 'canDeleteIssues'],
    directLabel: 'issues',
    globalKeys: ['canCreateIssues', 'canUpdateIssues', 'canDeleteIssues'],
    globalLabel: 'issues',
  },
]

export const getGlobalPermissionRows = (
  global: GlobalPermissions,
): Array<PermissionRow<keyof GlobalPermissions>> => {
  const inherited = PERMISSION_COLUMNS.map(() => false)

  return PERMISSION_DEFINITIONS.map((definition) => ({
    cells: definition.globalKeys.map((key, index) => {
      const isInherited = inherited[index]!
      const checked = global[key] || isInherited
      inherited[index] = checked
      return {
        checked,
        disabled: isInherited,
        key,
        title: isInherited ? 'Inherited' : undefined,
      }
    }),
    label: definition.globalLabel,
  }))
}

export const isGlobalReadInherited = (
  rows: Array<PermissionRow<keyof GlobalPermissions>>,
): boolean => rows.some((row) => row.cells.some((cell) => cell?.checked ?? false))

export const getDirectPermissionTables = ({
  globalRows,
  permissions,
  spaces,
}: {
  globalRows: Array<PermissionRow<keyof GlobalPermissions>>
  permissions: MemberPermissions
  spaces: MemberPermissionsPageData['spaces']
}): Record<string, DirectPermissionTable> =>
  Object.fromEntries(
    spaces.map((space) => {
      const direct = permissions.direct[space.id]
      const inherited = PERMISSION_COLUMNS.map(() => false)

      const rows = PERMISSION_DEFINITIONS.map((definition, rowIndex) => ({
        cells: definition.directKeys.map((key, index) => {
          if (!key) {
            return null
          }
          const unavailable = space.isDefault && key === 'canDelete'
          const isInherited = globalRows[rowIndex]!.cells[index]!.checked || inherited[index]!
          const checked = !unavailable && ((direct?.[key] ?? false) || isInherited)
          inherited[index] = checked
          return {
            checked,
            disabled: unavailable || isInherited,
            key,
            title: unavailable ? 'Not allowed' : isInherited ? 'Inherited' : undefined,
          }
        }),
        label: definition.directLabel,
      }))

      return [
        space.id,
        {
          readInherited:
            permissions.global.canRead ||
            isGlobalReadInherited(globalRows) ||
            rows.some((row) => row.cells.some((cell) => cell?.checked ?? false)),
          rows,
        },
      ]
    }),
  )
