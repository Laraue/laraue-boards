import { createRetroChannel } from '#infrastructure/realtime/retroChannel'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'

export const createCreateChannel =
  (hubUrl: string): RetroBoardPageDeps['createChannel'] =>
  (retroId) =>
    createRetroChannel(hubUrl, retroId)
