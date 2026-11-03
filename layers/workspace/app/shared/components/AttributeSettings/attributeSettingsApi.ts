import type { components } from '#infrastructure/api/generated'
import type {
  AttributeSettingItem,
  AttributeSettingsSave,
  AttributeSettingsSource,
  AttributeSettingsView,
} from '#layers/workspace/app/shared/components/AttributeSettings/AttributeSettings.types'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

type Schemas = components['schemas']

const mapSource = (source: Schemas['AttributeSettingsSource']): AttributeSettingsSource => {
  switch (source) {
    case 'Organization':
      return 'organization'
    case 'Space':
      return 'space'
    case 'Epic':
      return 'epic'
    default:
      return assertNever(source)
  }
}

const mapAttributes = (attributes: Schemas['AttributeSettingDto'][]): AttributeSettingItem[] =>
  attributes.map((attribute) => ({
    color: attribute.color,
    id: String(attribute.attributeId),
    isEnabled: attribute.isEnabled,
    name: attribute.name,
    showOnCard: attribute.showOnCard,
  }))

/** The settings of a space or a board as the settings pages show them. */
export const mapAttributeSettingsView = (
  settings: Schemas['AttributeSettingsViewDto'],
): AttributeSettingsView => ({
  attributes: mapAttributes(settings.attributes),
  inherited: {
    attributes: mapAttributes(settings.inherited.attributes),
    source: mapSource(settings.inherited.source),
  },
  source: mapSource(settings.source),
})

/** The settings to send with a space or board update; null leaves them as they are. */
export const toAttributeSettingsUpdate = (
  save: AttributeSettingsSave | null,
): null | Schemas['AttributeSettingsUpdate'] =>
  save && {
    overridden: save.overridden,
    settings: save.settings.map((setting) => ({
      attributeId: Number(setting.id),
      isEnabled: setting.isEnabled,
      showOnCard: setting.showOnCard,
    })),
  }
