import { expect, test } from 'vitest'
import { ref } from 'vue'

import { createOrganizationRoutes } from './organizationRoutes'

test('uses the explicitly supplied organization without a router context', () => {
  const key = ref('first')
  const routes = createOrganizationRoutes(key)

  expect(routes.issue('ISS-1').params).toEqual({ issueKey: 'ISS-1', organizationKey: 'first' })
  key.value = 'second'
  expect(routes.board('WEB', '7').params).toEqual({
    boardId: '7',
    organizationKey: 'second',
    spaceKey: 'WEB',
  })
})
