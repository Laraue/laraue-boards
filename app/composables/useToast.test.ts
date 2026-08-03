import { assert, beforeEach, test } from 'vitest'

import { useToast } from '~/composables/useToast'

const messages = (): string[] => useToast().toasts.value.map((toast) => toast.message)

beforeEach(() => {
  useToast().toasts.value = []
})

test('counts a repeat on the card that is already showing', () => {
  const { show, toasts } = useToast()

  show('Server error. Try again.')
  show('Server error. Try again.')
  show('Server error. Try again.')

  assert.deepEqual(messages(), ['Server error. Try again.'])
  assert.equal(toasts.value[0]?.count, 3)
})

test('keeps only the newest three toasts', () => {
  const { show } = useToast()

  for (const code of ['a', 'b', 'c', 'd']) {
    show(code)
  }

  assert.deepEqual(messages(), ['b', 'c', 'd'])
})
