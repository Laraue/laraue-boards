import { afterEach, expect, test, vi } from 'vitest'

import { loadScript } from './loadScript'
import { loadTelegramMiniAppData } from './loadTelegramMiniAppData'

vi.mock('./loadScript', () => ({ loadScript: vi.fn<typeof loadScript>() }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

test('waits for the SDK before reading Mini App data', async () => {
  vi.stubGlobal('window', {})
  vi.mocked(loadScript).mockImplementation(async () => {
    vi.stubGlobal('Telegram', { WebApp: { initData: 'signed-data' } })
  })

  expect(await loadTelegramMiniAppData()).toBe('signed-data')
  expect(loadScript).toHaveBeenCalledWith('https://telegram.org/js/telegram-web-app.js?61')
})

test('reuses the SDK when it has already loaded', async () => {
  vi.stubGlobal('window', {})
  vi.stubGlobal('Telegram', { WebApp: { initData: 'signed-data' } })

  expect(await loadTelegramMiniAppData()).toBe('signed-data')
  expect(loadScript).not.toHaveBeenCalled()
})

test('a script failure leaves other sign-in methods available', async () => {
  vi.stubGlobal('window', {})
  vi.mocked(loadScript).mockRejectedValue(new Error('offline'))

  expect(await loadTelegramMiniAppData()).toBeUndefined()
})

test('does not load a browser script on the server', async () => {
  expect(await loadTelegramMiniAppData()).toBeUndefined()
  expect(loadScript).not.toHaveBeenCalled()
})
