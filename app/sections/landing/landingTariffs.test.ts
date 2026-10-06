import { assert, expect, test } from 'vitest'

import { createTestBillingApiClient } from '#infrastructure/api/testApiClient'

import { loadLandingTariffs } from './landingTariffs'

const personal = {
  billingPeriod: 'Forever',
  currencyCode: 'USD',
  formattedPrice: '0$',
  id: 'free',
  includedTokensCount: '0',
  limitFreeTeamOrganizationsCount: 1,
  limitIssuesPerMonth: 500,
  price: 0,
  title: 'Free',
  type: 'LaraueBoardsPersonal',
}

test('requests the Boards tariffs without choosing a currency', async () => {
  const { client, requests } = createTestBillingApiClient(() => ({
    personalSubscriptions: [],
    teamSubscriptions: [],
  }))

  await loadLandingTariffs(client)

  const url = new URL(requests[0]!.url)
  assert.equal(url.pathname, '/api/tariffs')
  assert.equal(url.searchParams.has('CurrencyCode'), false)
  assert.equal(url.searchParams.get('ServiceId'), 'LaraueBoards')
})

test('maps billing tariffs to the landing view model', async () => {
  const { client } = createTestBillingApiClient(() => ({
    personalSubscriptions: [personal],
    teamSubscriptions: [
      {
        ...personal,
        billingDuration: 3,
        billingPeriod: 'Month',
        includedTokensCount: '750000',
        limitIssuesPerMonth: null,
        price: '6',
        title: 'Team',
        type: 'LaraueBoardsTeam',
      },
    ],
  }))

  assert.deepEqual(await loadLandingTariffs(client'USD'), {
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
        price: 6,
        title: 'Team',
        tokens: 750000,
      },
    ],
  })
})

test('treats a personal tariff without an organization limit as unlimited', async () => {
  const { client } = createTestBillingApiClient(() => ({
    personalSubscriptions: [
      { ...personal, limitFreeTeamOrganizationsCount: null },
      { ...personal, id: 'no-field', limitFreeTeamOrganizationsCount: undefined },
    ],
    teamSubscriptions: [],
  }))

  const result = await loadLandingTariffs(client'USD')

  assert.deepEqual(
    result.personal.map((tariff) => tariff.freeOrganizations),
    [null, null],
  )
})

test('skips tariffs of other services', async () => {
  const { client } = createTestBillingApiClient(() => ({
    personalSubscriptions: [{ ...personal, type: 'MarkdownTranslatorPersonal' }],
    teamSubscriptions: [],
  }))

  assert.deepEqual(await loadLandingTariffs(client'USD'), { personal: [], team: [] })
})

test('reports the status code of a failed response', async () => {
  const { client } = createTestBillingApiClient(() => new Response(null, { status: 503 }))

  await expect(loadLandingTariffs(client'USD')).rejects.toMatchObject({ status: 503 })
})
