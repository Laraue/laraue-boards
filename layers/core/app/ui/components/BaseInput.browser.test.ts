import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, it } from 'vitest'
import { page } from 'vitest/browser'

import BaseInput from './BaseInput.vue'

it('keeps numeric input values as strings, including decimal zeros and empty values', async () => {
  const wrapper = await mountSuspended(BaseInput, {
    attachTo: document.body,
    attrs: { 'aria-label': 'Amount', step: 'any', type: 'number' },
    props: { modelValue: '' },
  })
  try {
    await page.getByRole('spinbutton', { name: 'Amount' }).fill('1.50')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1.50'])
    await page.getByRole('spinbutton', { name: 'Amount' }).fill('')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  } finally {
    wrapper.unmount()
  }
})

it('waits for IME composition to finish before updating the model', async () => {
  const wrapper = await mountSuspended(BaseInput, {
    attachTo: document.body,
    props: { modelValue: '' },
  })
  try {
    const input = wrapper.get('input').element
    input.dispatchEvent(new CompositionEvent('compositionstart'))
    input.value = '日本'
    input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toEqual([['日本']])
  } finally {
    wrapper.unmount()
  }
})

it('keeps a value rejected by a native input validator out of the model', async () => {
  const wrapper = await mountSuspended(BaseInput, {
    attachTo: document.body,
    attrs: {
      'aria-label': 'Integer',
      onInput: (event: Event) => {
        const input = event.target as HTMLInputElement
        if (!/^\d*$/.test(input.value)) {
          input.value = ''
        }
      },
    },
    props: { modelValue: '' },
  })
  try {
    await page.getByRole('textbox', { name: 'Integer' }).fill('abc')
    await expect.element(page.getByRole('textbox', { name: 'Integer' })).toHaveValue('')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  } finally {
    wrapper.unmount()
  }
})
