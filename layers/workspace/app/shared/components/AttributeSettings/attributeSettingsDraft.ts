import type {
  AttributeSettingsDraft,
  AttributeSettingsSave,
  AttributeSettingsView,
} from '#layers/workspace/app/shared/components/AttributeSettings/AttributeSettings.types'

const isOwn = (view: AttributeSettingsView, owner: 'board' | 'space') =>
  view.source === (owner === 'space' ? 'space' : 'epic')

export const toAttributeSettingsDraft = (
  view: AttributeSettingsView,
  owner: 'board' | 'space',
): AttributeSettingsDraft => ({
  attributes: view.attributes.map((attribute) => ({ ...attribute })),
  overridden: isOwn(view, owner),
})

/** What to save for the edited draft; null when it's what was loaded, so a save leaves the settings alone. */
export const toAttributeSettingsSave = (
  view: AttributeSettingsView,
  owner: 'board' | 'space',
  draft: AttributeSettingsDraft,
): AttributeSettingsSave | null => {
  if (!draft.overridden) {
    return isOwn(view, owner) ? { overridden: false, settings: [] } : null
  }
  const settings = draft.attributes.map(({ id, isEnabled, showOnCard }) => ({
    id,
    isEnabled,
    showOnCard: isEnabled && showOnCard,
  }))
  const unchanged =
    isOwn(view, owner) &&
    settings.every((setting, index) => {
      const saved = view.attributes[index]
      return (
        saved?.id === setting.id &&
        saved.isEnabled === setting.isEnabled &&
        (saved.isEnabled && saved.showOnCard) === setting.showOnCard
      )
    })
  return unchanged ? null : { overridden: true, settings }
}
