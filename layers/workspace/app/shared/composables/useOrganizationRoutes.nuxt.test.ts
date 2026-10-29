import { assert, test, vi } from 'vitest'

vi.mock('#app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#app')>()),
  useRoute: () => ({ params: { organizationKey: 'acme-ab12' } }),
}))

const { useOrganizationRoutes } =
  await import('#layers/workspace/app/shared/composables/useOrganizationRoutes')

test('adds the current organization to typed routes', () => {
  const routes = useOrganizationRoutes()
  assert.deepEqual(routes.board('DEF', '5'), {
    name: 'organizations-organizationKey-spaces-spaceKey-boardId',
    params: {
      boardId: '5',
      organizationKey: 'acme-ab12',
      spaceKey: 'DEF',
    },
  })
  assert.deepEqual(routes.issue('BRD-120'), {
    name: 'organizations-organizationKey-issues-issueKey',
    params: {
      issueKey: 'BRD-120',
      organizationKey: 'acme-ab12',
    },
  })
})
