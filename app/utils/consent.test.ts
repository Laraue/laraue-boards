import { assert, test } from 'vitest'

import {
  decideConsent,
  detectCountryCode,
  isAnalyticsBlockedCountry,
  isConsentPage,
  isConsentRequiredCountry,
  parseTraceCountry,
} from './consent'

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
  for (const path of ['/', '/ru', '/en/documentation', '/ru/documentation/concepts/issues']) {
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
    '/documentation',
    '/ru/organizations',
  ]) {
    assert.isFalse(isConsentPage(path), path)
  }
})
