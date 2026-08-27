import { createRetroChannel } from '#infrastructure/realtime/retroChannel'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createCreateChannel =
  (baseUrl: string): RetroBoardPageDeps['createChannel'] =>
  (retroId) =>
    createRetroChannel(baseUrl, retroId)
