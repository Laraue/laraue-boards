import type {
  SpaceAboutSettingsData,
  SpaceLinkInput,
  SpaceLinkItem,
} from './SpaceAboutSettings.types'

export type SpaceAboutSettingsDeps = {
  createLink: (input: SpaceLinkInput & { spaceKey: string }) => Promise<SpaceLinkItem>
  deleteLink: (input: { id: string; spaceKey: string }) => Promise<void>
  saveDescription: (input: { description: string; spaceKey: string }) => Promise<void>
  updateLink: (input: SpaceLinkInput & { id: string; spaceKey: string }) => Promise<void>
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<SpaceAboutSettingsData>
}
