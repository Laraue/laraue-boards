import type { components } from '#infrastructure/api/retro.generated'
import { createRetroChannel } from '#infrastructure/realtime/retroChannel'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'
import { mapRetro } from './mapRetro'

export const createCreateChannel =
  (hubUrl: string): RetroBoardPageDeps['createChannel'] =>
  (retroId) => {
    const channel = createRetroChannel(hubUrl, retroId)

    return {
      ...channel,
      sync: () => channel.sync<components['schemas']['GetRetroResponse']>().then(mapRetro),
    }
  }
