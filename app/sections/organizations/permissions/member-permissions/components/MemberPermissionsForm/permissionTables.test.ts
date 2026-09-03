import { assert, test } from 'vitest'

import type {
  GlobalPermissions,
  MemberPermissions,
  MemberPermissionsPageData,
} from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.types'

import {
  getDirectPermissionTables,
  getGlobalPermissionRows,
  isGlobalReadInherited,
  type PermissionRow,
} from './permissionTables'

const noGlobal: GlobalPermissions = {
  canCreateBoards: false,
  canCreateIssues: false,
  canCreateRetros: false,
  canCreateSpaces: false,
  canDeleteBoards: false,
  canDeleteIssues: false,
  canDeleteSpaces: false,
  canRead: false,
  canUpdateBoards: false,
  canUpdateIssues: false,
  canUpdateSpaces: false,
}

const noDirect = {
  canCreateBoards: false,
  canCreateIssues: false,
  canDelete: false,
  canDeleteBoards: false,
  canDeleteIssues: false,
  canRead: false,
  canUpdate: false,
  canUpdateBoards: false,
  canUpdateIssues: false,
}

const spaces: MemberPermissionsPageData['spaces'] = [
  { color: '#000', id: '10', isDefault: true, name: 'Backlog' },
  { color: '#fff', id: '11', isDefault: false, name: 'Product' },
]

const permissionsOf = (overrides: Partial<MemberPermissions> = {}): MemberPermissions => ({
  admin: {
    canDeleteOrganization: false,
    canManageAttributes: false,
    canManageMembers: false,
    canMoveData: false,
    canUpdateOrganization: false,
  },
  direct: { '10': { ...noDirect }, '11': { ...noDirect } },
  global: { ...noGlobal },
  ...overrides,
})

const checkedOf = <Key extends string>(rows: Array<PermissionRow<Key>>) =>
  rows.map((row) => row.cells.map((cell) => cell?.checked ?? null))

const disabledOf = <Key extends string>(rows: Array<PermissionRow<Key>>) =>
  rows.map((row) => row.cells.map((cell) => cell?.disabled ?? null))

test('leaves every global cell unchecked and editable when nothing is granted', () => {
  const rows = getGlobalPermissionRows(noGlobal)

  assert.deepEqual(checkedOf(rows), [
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ])
  assert.deepEqual(disabledOf(rows), [
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ])
})

test('cascades a granted global operation down to the rows below it', () => {
  const rows = getGlobalPermissionRows({ ...noGlobal, canCreateSpaces: true })

  assert.deepEqual(checkedOf(rows), [
    [true, false, false],
    [true, false, false],
    [true, false, false],
  ])
  assert.deepEqual(disabledOf(rows), [
    [false, false, false],
    [true, false, false],
    [true, false, false],
  ])
  assert.equal(rows[1]!.cells[0]!.title, 'Inherited')
})

test('does not cascade an operation granted on a lower row upwards', () => {
  const rows = getGlobalPermissionRows({ ...noGlobal, canCreateBoards: true })

  assert.deepEqual(checkedOf(rows), [
    [false, false, false],
    [true, false, false],
    [true, false, false],
  ])
})

test('treats read as inherited once any other global permission is granted', () => {
  assert.equal(isGlobalReadInherited(getGlobalPermissionRows(noGlobal)), false)
  assert.equal(
    isGlobalReadInherited(getGlobalPermissionRows({ ...noGlobal, canDeleteIssues: true })),
    true,
  )
})

test('marks the space row create cell as absent because a space is not created from a space', () => {
  const permissions = permissionsOf()
  const tables = getDirectPermissionTables({
    globalRows: getGlobalPermissionRows(permissions.global),
    permissions,
    spaces,
  })

  assert.equal(tables['11']!.rows[0]!.cells[0], null)
})

test('inherits a direct cell from the matching global column', () => {
  const permissions = permissionsOf({ global: { ...noGlobal, canUpdateSpaces: true } })
  const tables = getDirectPermissionTables({
    globalRows: getGlobalPermissionRows(permissions.global),
    permissions,
    spaces,
  })
  const cell = tables['11']!.rows[0]!.cells[1]!

  assert.equal(cell.checked, true)
  assert.equal(cell.disabled, true)
  assert.equal(cell.title, 'Inherited')
})

test('cascades a granted direct operation down to the rows below it', () => {
  const permissions = permissionsOf()
  permissions.direct['11']!.canUpdate = true
  const tables = getDirectPermissionTables({
    globalRows: getGlobalPermissionRows(permissions.global),
    permissions,
    spaces,
  })

  assert.deepEqual(checkedOf(tables['11']!.rows), [
    [null, true, false],
    [false, true, false],
    [false, true, false],
  ])
})

test('never allows deleting the default space', () => {
  const permissions = permissionsOf({ global: { ...noGlobal, canDeleteSpaces: true } })
  permissions.direct['10']!.canDelete = true
  const tables = getDirectPermissionTables({
    globalRows: getGlobalPermissionRows(permissions.global),
    permissions,
    spaces,
  })
  const defaultSpaceDelete = tables['10']!.rows[0]!.cells[2]!
  const otherSpaceDelete = tables['11']!.rows[0]!.cells[2]!

  assert.equal(defaultSpaceDelete.checked, false)
  assert.equal(defaultSpaceDelete.disabled, true)
  assert.equal(defaultSpaceDelete.title, 'Not allowed')
  assert.equal(otherSpaceDelete.checked, true)
})

test('treats direct read as inherited from global read, global grants, or a direct grant', () => {
  const globalRead = permissionsOf({ global: { ...noGlobal, canRead: true } })
  const globalGrant = permissionsOf({ global: { ...noGlobal, canCreateIssues: true } })
  const directGrant = permissionsOf()
  directGrant.direct['11']!.canUpdateBoards = true
  const plain = permissionsOf()

  const readInherited = (permissions: MemberPermissions) =>
    getDirectPermissionTables({
      globalRows: getGlobalPermissionRows(permissions.global),
      permissions,
      spaces,
    })['11']!.readInherited

  assert.equal(readInherited(globalRead), true)
  assert.equal(readInherited(globalGrant), true)
  assert.equal(readInherited(directGrant), true)
  assert.equal(readInherited(plain), false)
})
