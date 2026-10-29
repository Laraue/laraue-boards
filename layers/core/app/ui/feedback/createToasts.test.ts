import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { createToasts } from './createToasts'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('counts repeated messages and keeps only the newest three cards', () => {
  const service = createToasts()
  service.show('same')
  service.show('same')
  expect(service.toasts.value[0]?.count).toBe(2)
  for (const message of ['b', 'c', 'd']) {
    service.show(message)
  }
  expect(service.toasts.value.map((t) => t.message)).toEqual(['b', 'c', 'd'])
  vi.advanceTimersByTime(5000)
  expect(service.toasts.value).toEqual([])
})

test('instances do not share messages or timers, and disposal clears pending timers', () => {
  const first = createToasts(),
    second = createToasts()
  first.show('first')
  second.show('second')
  first.dispose()
  expect(first.toasts.value).toEqual([])
  expect(second.toasts.value.map((t) => t.message)).toEqual(['second'])
  second.dispose()
  expect(vi.getTimerCount()).toBe(0)
})
