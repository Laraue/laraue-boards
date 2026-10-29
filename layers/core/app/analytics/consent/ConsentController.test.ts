import { expect, test, vi } from 'vitest'

import { createConsentController } from './ConsentController'
import type { ConsentControllerDeps } from './ConsentController.deps'

const depsOf = (overrides: Partial<ConsentControllerDeps> = {}): ConsentControllerDeps => ({
  detectCountryCode: async () => 'DE',
  initializeAnalytics: vi.fn<ConsentControllerDeps['initializeAnalytics']>(),
  readStoredChoice: () => null,
  saveChoice: () => {},
  setAnalyticsConsent: vi.fn<ConsentControllerDeps['setAnalyticsConsent']>(),
  ...overrides,
})

test('does not start analytics before consent or on workspace routes', () => {
  const deps = depsOf()
  const controller = createConsentController(deps)

  controller.apply(null, '/')
  controller.apply('denied', '/')
  controller.apply('granted', '/organizations/acme/issues')

  expect(deps.initializeAnalytics).not.toHaveBeenCalled()
  expect(deps.setAnalyticsConsent).not.toHaveBeenCalled()
})

test('starts the script once and switches consent when leaving and returning to public pages', () => {
  const deps = depsOf()
  const controller = createConsentController(deps)

  controller.apply('granted', '/')
  controller.apply('granted', '/organizations')
  controller.apply('granted', '/ru/documentation/concepts/issues')
  controller.apply('denied', '/ru/documentation/concepts/issues')

  expect(deps.initializeAnalytics).toHaveBeenCalledOnce()
  expect(vi.mocked(deps.setAnalyticsConsent).mock.calls).toEqual([
    ['granted'],
    ['denied'],
    ['granted'],
    ['denied'],
  ])
})

test('resolves consent using the country and saved choice', async () => {
  const controller = createConsentController(depsOf({ readStoredChoice: () => 'granted' }))

  expect(await controller.resolve()).toEqual({ consent: 'granted', required: true })
})

test('a blocked country overrides a previously granted choice', async () => {
  const controller = createConsentController(
    depsOf({
      detectCountryCode: async () => 'RU',
      readStoredChoice: () => 'granted',
    }),
  )

  expect(await controller.resolve()).toEqual({ consent: 'denied', required: false })
})
