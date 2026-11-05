import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { AttributeSettingsDraft, AttributeSettingsView } from './AttributeSettings.types'
import AttributeSettings from './AttributeSettings.vue'

const type = { color: '#111', id: '3', isEnabled: true, name: 'Type', showOnCard: true }
const estimate = { color: '#222', id: '4', isEnabled: false, name: 'Estimate', showOnCard: false }

const inherited: AttributeSettingsView = {
  attributes: [type, estimate],
  inherited: { attributes: [type, estimate], source: 'organization' },
  source: 'organization',
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  view: AttributeSettingsView,
  modelValue: AttributeSettingsDraft,
  onUpdate: (value: AttributeSettingsDraft) => void,
  canEdit = true,
) => {
  currentWrapper = await mountSuspended(AttributeSettings, {
    attachTo: document.body,
    props: {
      canEdit,
      description: 'Follows the organization.',
      modelValue,
      'onUpdate:modelValue': onUpdate,
      view,
    },
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows inherited settings read-only and starts own ones from them on override', async () => {
  const onUpdate = vi.fn<(value: AttributeSettingsDraft) => void>()

  await mount(inherited, { attributes: [], overridden: false }, onUpdate)

  await expect.element(page.getByText('Follows the organization.')).toBeInTheDocument()
  await expect.element(page.getByText('Overridden')).not.toBeInTheDocument()
  await expect.element(page.getByRole('checkbox', { name: 'Available' }).first()).toBeDisabled()
  await page.getByRole('button', { name: 'Override' }).click()

  expect(onUpdate).toHaveBeenCalledWith({ attributes: [type, estimate], overridden: true })
})

it('lets own settings be edited and dropped', async () => {
  const draft: AttributeSettingsDraft = {
    attributes: [{ ...type }, { ...estimate }],
    overridden: true,
  }
  const onUpdate = vi.fn<(value: AttributeSettingsDraft) => void>()

  await mount({ ...inherited, source: 'space' }, draft, onUpdate)

  await expect.element(page.getByText('Overridden')).toBeInTheDocument()
  await page.getByRole('checkbox', { name: 'Available' }).first().click()
  expect(draft.attributes[0]?.isEnabled).toBe(false)
  await page.getByRole('button', { name: 'Reset to inherited' }).click()

  expect(onUpdate).toHaveBeenCalledWith({ attributes: [], overridden: false })
})

it('offers no changes to someone who cannot edit', async () => {
  await mount(inherited, { attributes: [], overridden: false }, vi.fn(), false)

  await expect.element(page.getByRole('button', { name: 'Override' })).not.toBeInTheDocument()
})
