import { defineNitroPlugin } from 'nitropack/runtime'

import { consoleEntry, requestErrorEntry, writeEntry } from '../utils/jsonLog'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event, tags }) => {
    writeEntry(requestErrorEntry(error, event?.path, tags))
  })

  if (import.meta.dev) {
    return
  }

  // oxlint-disable-next-line no-console -- replaces the method, doesn't log through it
  console.debug = (...args: unknown[]) => writeEntry(consoleEntry('debug', args))
  console.info = (...args: unknown[]) => writeEntry(consoleEntry('info', args))
  // oxlint-disable-next-line no-console -- replaces the method, doesn't log through it
  console.log = console.info
  console.warn = (...args: unknown[]) => writeEntry(consoleEntry('warn', args))
  console.error = (...args: unknown[]) => writeEntry(consoleEntry('error', args))
})
