import { buildDocsTree, flattenDocsTree, toDocLink } from './buildDocsTree'
import type { DocEntry, DocNode, DocPage, DocsLocale } from './DocsContent.types'
import { parseDocEntry } from './parseDocEntry'
import { renderDocMarkdown } from './renderDocMarkdown'

const locales = ['en', 'ru'] as const

const pathKey = (path: string[]): string => path.join('/')

// All the docs of every language, read from `files` (a path inside the docs folder -> markdown).
export const createDocsCatalog = (files: Record<string, string>) => {
  const entries: Record<DocsLocale, Map<string, DocEntry>> = { en: new Map(), ru: new Map() }
  for (const [file, raw] of Object.entries(files)) {
    const { entry, locale } = parseDocEntry(file, raw)
    entries[locale].set(pathKey(entry.path), entry)
  }

  const trees: Record<DocsLocale, DocNode> = {
    en: buildDocsTree([...entries.en.values()]),
    ru: buildDocsTree([...entries.ru.values()]),
  }
  // The pages of each language in reading order.
  const readingOrder: Record<DocsLocale, DocNode[]> = {
    en: flattenDocsTree(trees.en),
    ru: flattenDocsTree(trees.ru),
  }

  return {
    page(locale: DocsLocale, path: string[]): DocPage | undefined {
      const entry = entries[locale].get(pathKey(path))
      if (!entry) {
        return undefined
      }

      const reading = readingOrder[locale]
      const index = reading.findIndex((node) => pathKey(node.path) === pathKey(path))
      const previous = reading[index - 1]
      const next = reading[index + 1]
      const { headings, html } = renderDocMarkdown(entry.body)

      // The home page, then every section the page is inside of, then the page itself.
      const breadcrumbs = reading
        .filter(
          (node) =>
            node.path.length <= path.length &&
            node.path.every((segment, position) => path[position] === segment),
        )
        .map((node) => toDocLink(node))

      return {
        alternates: locales.filter((other) => entries[other].has(pathKey(path))),
        breadcrumbs,
        headings,
        html,
        meta: entry.meta,
        next: next ? toDocLink(next) : undefined,
        previous: index > 0 && previous ? toDocLink(previous) : undefined,
      }
    },
    tree: (locale: DocsLocale): DocNode => trees[locale],
  }
}

export type DocsCatalog = ReturnType<typeof createDocsCatalog>
