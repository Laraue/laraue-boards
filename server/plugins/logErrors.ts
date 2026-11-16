import { defineNitroPlugin } from 'nitropack/runtime'

import { errorFields, writeEntry } from '../utils/jsonLog'

// Logs the server errors Nitro doesn't: it prints unhandled and fatal ones itself ("[request error]"), so a
// handled 5xx would go unseen. A 4xx is the client's mistake, mostly bots probing paths, and is already in the
// nginx access log: not logged (BRD-374, it was 692 of 725 "[SSR ERROR]" entries a day).
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const { fatal, statusCode, unhandled } = error as {
      fatal?: unknown
      statusCode?: unknown
      unhandled?: unknown
    }
    const status = typeof statusCode === 'number' ? statusCode : 500
    if (status < 500 || unhandled === true || fatal === true) {
      return
    }

    const path = event?.path ?? 'unknown'
    writeEntry({
      error: errorFields(error),
      level: 'error',
      message: `[SSR ERROR] ${path}: ${error.message}`,
      path,
      time: new Date().toISOString(),
    })
  })
})
