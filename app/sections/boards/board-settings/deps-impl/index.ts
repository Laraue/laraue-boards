import type { ApiClient } from '#infrastructure/api/client'

import type { BoardSettingsPageDeps } from '../BoardSettingsPage.deps'
import { createRemoveBoard } from './removeBoard'
import { createSaveBoardSettings } from './saveBoardSettings'
import { createViewBoardSettings } from './viewBoardSettings'

export const createBoardSettingsPageDeps = (client: ApiClient): BoardSettingsPageDeps => ({
  remove: createRemoveBoard(client),
  save: createSaveBoardSettings(client),
  view: createViewBoardSettings(client),
})
