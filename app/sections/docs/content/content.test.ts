import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assert, test } from 'vitest'

import { createDocsCatalog } from './docsCatalog'

const docsFolder = fileURLToPath(new URL('../../../../content/docs', import.meta.url))

const listFiles = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(folder, entry.name)) : [join(folder, entry.name)],
  )

const files = Object.fromEntries(
  listFiles(docsFolder)
    .filter((path) => path.endsWith('.md'))
    // Keys use `/` like the app's own file list, also on Windows where `relative` gives `\`.
    .map((path) => [relative(docsFolder, path).replaceAll('\\', '/'), readFileSync(path, 'utf8')]),
)

// The real documentation, not fixtures: a broken file or link should fail the build.
const catalog = createDocsCatalog(files)

test('has every page in both languages', () => {
  const pages = (locale: string) =>
    Object.keys(files)
      .filter((file) => file.startsWith(`${locale}/`))
      .map((file) => file.slice(locale.length + 1))
      .toSorted()

  assert.deepEqual(pages('ru'), pages('en'))
})

test('links only to pages that exist', () => {
  const broken: string[] = []
  for (const [file, raw] of Object.entries(files)) {
    for (const match of raw.matchAll(/\]\(\/(en|ru)\/documentation([^)#\s]*)[^)]*\)/g)) {
      const path = (match[2] ?? '').split('/').filter(Boolean)
      if (!catalog.page(match[1] === 'ru' ? 'ru' : 'en', path)) {
        broken.push(`${file}: ${match[0]}`)
      }
    }
  }

  assert.deepEqual(broken, [])
})

test('links each page to the docs of its own language', () => {
  const foreign = Object.entries(files).flatMap(([file, raw]) => {
    const locale = file.split('/')[0]
    return [...raw.matchAll(/\]\(\/(en|ru)\/documentation/g)]
      .filter((match) => match[1] !== locale)
      .map(() => file)
  })

  assert.deepEqual(foreign, [])
})

test('has no leftovers of the old address', () => {
  assert.deepEqual(
    Object.entries(files)
      .filter(([, raw]) => raw.includes('/blog/documentation'))
      .map(([file]) => file),
    [],
  )
})
