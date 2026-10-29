import { assert, test } from 'vitest'

import {
  decideConsent,
  detectCountryCode,
  isAnalyticsBlockedCountry,
  isConsentPage,
  isConsentRequiredCountry,
  parseTraceCountry,
} from './decision'

test('requires consent in the EU, the EEA, the UK and Switzerland', () => {
  for (const country of ['DE', 'fr', 'NO', 'GB', 'CH']) {
    assert.isTrue(isConsentRequiredCountry(country), country)
  }
})

test('does not require consent elsewhere', () => {
  for (const country of ['US', 'BR', 'JP']) {
    assert.isFalse(isConsentRequiredCountry(country), country)
  }
})

test('requires consent when the country is unknown', () => {
  assert.isTrue(isConsentRequiredCountry(null))
  assert.isTrue(isConsentRequiredCountry(undefined))
})

test('blocks analytics for Russia only, and not for an unknown country', () => {
  assert.isTrue(isAnalyticsBlockedCountry('RU'))
  assert.isTrue(isAnalyticsBlockedCountry('ru'))
  assert.isFalse(isAnalyticsBlockedCountry('DE'))
  assert.isFalse(isAnalyticsBlockedCountry(null))
})

test('reads the country from Cloudflare trace', () => {
  assert.equal(parseTraceCountry('fl=1\nh=boards.laraue.com\nloc=DE\ntls=TLSv1.3'), 'DE')
  assert.isNull(parseTraceCountry('fl=1\nh=boards.laraue.com'))
})

test('detects the country of the visitor', async () => {
  const requests: string[] = []
  const country = await detectCountryCode(async (input) => {
    requests.push(String(input))
    return new Response('loc=NL\n')
  })

  assert.equal(country, 'NL')
  assert.deepEqual(requests, ['/cdn-cgi/trace'])
})

test('has no country when Cloudflare does not answer', async () => {
  assert.isNull(await detectCountryCode(async () => new Response('', { status: 404 })))
  assert.isNull(
    await detectCountryCode(async () => {
      throw new Error('offline')
    }),
  )
})

test('does not request Cloudflare trace on loopback origins and still requires consent', async () => {
  const requests: string[] = []
  const fetcher: typeof globalThis.fetch = async (input) => {
    requests.push(String(input))
    return new Response('loc=NL\n')
  }
  for (const hostname of ['localhost', 'app.localhost', '127.0.0.1', '127.0.0.2', '[::1]', '::1']) {
    const country = await detectCountryCode(fetcher, hostname)
    assert.isNull(country)
    assert.deepEqual(decideConsent(country, null), { consent: null, required: true })
  }
  assert.deepEqual(requests, [])
  assert.equal(await detectCountryCode(fetcher, '127.example.com'), 'NL')
  assert.deepEqual(requests, ['/cdn-cgi/trace'])
})

test('never runs analytics for visitors from Russia', () => {
  assert.deepEqual(decideConsent('RU', 'granted'), { consent: 'denied', required: false })
})

test('runs analytics without asking where consent is not required', () => {
  assert.deepEqual(decideConsent('US', null), { consent: 'granted', required: false })
})

test('asks visitors who need to consent and have not decided', () => {
  assert.deepEqual(decideConsent('DE', null), { consent: null, required: true })
  assert.deepEqual(decideConsent(null, 'nonsense'), { consent: null, required: true })
})

test('remembers the choice of a visitor who needs to consent', () => {
  assert.deepEqual(decideConsent('DE', 'granted'), { consent: 'granted', required: true })
  assert.deepEqual(decideConsent('DE', 'denied'), { consent: 'denied', required: true })
})

test('has analytics and the consent banner on the landing page and the documentation', () => {
  for (const path of [
    '/',
    '/ru',
    '/documentation',
    '/documentation/concepts/issues',
    '/ru/documentation',
    '/ru/documentation/concepts/issues',
  ]) {
    assert.isTrue(isConsentPage(path), path)
  }
})

test('has neither in the app', () => {
  for (const path of [
    '/login',
    '/account',
    '/organizations',
    '/organizations/acme/issues',
    '/join/abc',
    '/documentation-other',
    '/ru/organizations',
  ]) {
    assert.isFalse(isConsentPage(path), path)
  }
})
