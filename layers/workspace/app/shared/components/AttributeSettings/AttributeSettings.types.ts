export type AttributeSettingsSource = 'epic' | 'organization' | 'space'

export type AttributeSettingItem = {
  color: string
  id: string
  isEnabled: boolean
  name: string
  showOnCard: boolean
}

export type AttributeSettingsView = {
  attributes: AttributeSettingItem[]
  // What the space or board follows without its own settings.
  inherited: { attributes: AttributeSettingItem[]; source: AttributeSettingsSource }
  source: AttributeSettingsSource
}

// The settings being edited in a form: own ones, or none to follow the level above.
export type AttributeSettingsDraft = {
  attributes: AttributeSettingItem[]
  overridden: boolean
}

// What a save sends: own settings, or none to follow the level above.
export type AttributeSettingsSave = {
  overridden: boolean
  settings: Array<{ id: string; isEnabled: boolean; showOnCard: boolean }>
}
