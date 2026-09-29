import { assert, test } from 'vitest'

import type { LandingTariffs } from '../LandingPage.types'
import { createFetchTariffs } from './fetchTariffs'

const tariffs: LandingTariffs = { personal: [], team: [] }

test('requests the tariffs of the chosen currency from the app', async () => {
  const requests: { options: unknown; url: string }[] = []
  const fetchTariffs = createFetchTariffs(async (url, options) => {
    requests.push({ options, url })
    return tariffs
  })

  assert.deepEqual(await fetchTariffs('RUB'), { data: tariffs, status: 'success' })
  assert.deepEqual(requests, [{ options: { query: { currency: 'RUB' } }, url: '/landing/tariffs' }])
})

test('reports the status code of a failed request', async () => {
  const fetchTariffs = createFetchTariffs(async () => {
    throw Object.assign(new Error('Bad Gateway'), { statusCode: 502 })
  })

  assert.deepEqual(await fetchTariffs('USD'), { code: 502, status: 'error' })
})

test('reports a network failure', async () => {
  const fetchTariffs = createFetchTariffs(async () => {
    throw new Error('offline')
  })

  assert.deepEqual(await fetchTariffs('USD'), { code: 0, status: 'error' })
})
