import { assert, expect, test } from 'vitest'

import type { LandingTariffs } from './LandingPage.deps'
import { createLandingPageDeps } from './LandingPage.deps.impl'

const tariffs: LandingTariffs = { personal: [], team: [] }

test('requests the tariffs from the app', async () => {
  const requests: string[] = []
  const { getTariffs } = createLandingPageDeps(async (url) => {
    requests.push(url)
    return tariffs
  })

  assert.deepEqual(await getTariffs(), tariffs)
  assert.deepEqual(requests, ['/landing/tariffs'])
})

test('reports the status code of a failed request', async () => {
  const { getTariffs } = createLandingPageDeps(async () => {
    throw Object.assign(new Error('Bad Gateway'), { statusCode: 502 })
  })

  await expect(getTariffs()).rejects.toMatchObject({ status: 502 })
})

test('reports a network failure', async () => {
  const { getTariffs } = createLandingPageDeps(async () => {
    throw new Error('offline')
  })

  await expect(getTariffs()).rejects.toMatchObject({ status: 0 })
})
