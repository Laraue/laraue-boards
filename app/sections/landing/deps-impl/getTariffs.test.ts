import { assert, test } from 'vitest'

import { createGetTariffs } from './getTariffs'

const tariff = {
  billingDuration: null,
  billingPeriod: 'Forever',
  currencyCode: 'USD',
  formattedPrice: '0$',
  id: 'free',
  includedTokensCount: 0,
  limitFreeTeamOrganizationsCount: 1,
  limitIssuesPerMonth: 500,
  price: 0,
  title: 'Free',
}

test('requests the Boards tariffs in the chosen currency', async () => {
  const urls: string[] = []
  const getTariffs = createGetTariffs('https://billing.test/api', async (input) => {
    urls.push(String(input))
    return Response.json({ personalSubscriptions: [], teamSubscriptions: [] })
  })

  await getTariffs('RUB')

  assert.deepEqual(urls, [
    'https://billing.test/api/tariffs?currencyCode=RUB&serviceId=LaraueBoards',
  ])
})

test('maps billing tariffs to the landing view model', async () => {
  const getTariffs = createGetTariffs('https://billing.test/api', async () =>
    Response.json({
      personalSubscriptions: [tariff],
      teamSubscriptions: [
        {
          ...tariff,
          billingDuration: 3,
          billingPeriod: 'Month',
          limitFreeTeamOrganizationsCount: null,
          limitIssuesPerMonth: null,
          title: 'Team',
        },
      ],
    }),
  )

  assert.deepEqual(await getTariffs('USD'), {
    data: {
      personal: [
        {
          billing: { duration: 1, period: 'forever' },
          currencyCode: 'USD',
          formattedPrice: '0$',
          freeOrganizations: 1,
          id: 'free',
          issuesPerMonth: 500,
          price: 0,
          title: 'Free',
          tokens: 0,
        },
      ],
      team: [
        {
          billing: { duration: 3, period: 'month' },
          currencyCode: 'USD',
          formattedPrice: '0$',
          freeOrganizations: undefined,
          id: 'free',
          issuesPerMonth: undefined,
          price: 0,
          title: 'Team',
          tokens: 0,
        },
      ],
    },
    status: 'success',
  })
})

test('reports the status code of a failed response', async () => {
  const getTariffs = createGetTariffs(
    'https://billing.test/api',
    async () => new Response(null, { status: 503 }),
  )

  assert.deepEqual(await getTariffs('USD'), { code: 503, status: 'error' })
})

test('reports a network failure', async () => {
  const getTariffs = createGetTariffs('https://billing.test/api', async () => {
    throw new Error('offline')
  })

  assert.deepEqual(await getTariffs('USD'), { code: 0, status: 'error' })
})
