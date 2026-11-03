import { assert, test } from 'vitest'

import type { AttributeSettingsView } from './AttributeSettings.types'
import { toAttributeSettingsDraft, toAttributeSettingsSave } from './attributeSettingsDraft'

const type = { color: '#111', id: '3', isEnabled: true, name: 'Type', showOnCard: true }

const following: AttributeSettingsView = {
  attributes: [type],
  inherited: { attributes: [type], source: 'organization' },
  source: 'organization',
}

const own: AttributeSettingsView = { ...following, source: 'space' }

test('sends nothing when the settings stay as loaded', () => {
  assert.isNull(
    toAttributeSettingsSave(following, 'space', toAttributeSettingsDraft(following, 'space')),
  )
  assert.isNull(toAttributeSettingsSave(own, 'space', toAttributeSettingsDraft(own, 'space')))
})

test('sends own settings, off the cards where the attribute is not used', () => {
  const save = toAttributeSettingsSave(following, 'space', {
    attributes: [{ ...type, isEnabled: false }],
    overridden: true,
  })

  assert.deepEqual(save, {
    overridden: true,
    settings: [{ id: '3', isEnabled: false, showOnCard: false }],
  })
})

test('sends a reset only for settings that were own', () => {
  const draft = { attributes: [], overridden: false }

  assert.deepEqual(toAttributeSettingsSave(own, 'space', draft), {
    overridden: false,
    settings: [],
  })
  assert.isNull(toAttributeSettingsSave(following, 'space', draft))
})

test('reads a board as having own settings only when they are its own', () => {
  assert.isFalse(toAttributeSettingsDraft({ ...following, source: 'space' }, 'board').overridden)
  assert.isTrue(toAttributeSettingsDraft({ ...following, source: 'epic' }, 'board').overridden)
})
