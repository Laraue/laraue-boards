import type { DocEntry, DocKind, DocsLocale } from './DocsContent.types'
import { parseFrontmatter } from './parseFrontmatter'

const kinds: Record<string, DocKind> = {
  documentation: 'page',
  rootSectionDefinition: 'root',
  sectionDefinition: 'section',
}

export type ParsedDocFile = {
  entry: DocEntry
  locale: DocsLocale
}

const text = (value: string | string[] | undefined, key: string, file: string): string => {
  if (typeof value !== 'string' || value === '') {
    throw new Error(`${file}: "${key}" is missing in the frontmatter`)
  }

  return value
}

// `file` is a path inside the docs folder, e.g. `en/concepts/issues.md` or `ru/concepts/index.md`.
export const parseDocEntry = (file: string, raw: string): ParsedDocFile => {
  const [locale, ...segments] = file.replace(/\.md$/, '').split('/')
  if (locale !== 'en' && locale !== 'ru') {
    throw new Error(`${file}: the first folder must be a language (en or ru)`)
  }

  // `index` is the page of its folder itself: concepts/index -> ['concepts'].
  const path = segments.at(-1) === 'index' ? segments.slice(0, -1) : segments

  const { attributes, body } = parseFrontmatter(raw)
  const kind = kinds[text(attributes['type'], 'type', file)]
  if (!kind) {
    throw new Error(`${file}: unknown type "${String(attributes['type'])}"`)
  }
  const order = Number(attributes['order'] ?? 0)
  const icon = attributes['icon']
  const keywords = attributes['keywords']

  return {
    entry: {
      body,
      meta: {
        createdAt: text(attributes['createdAt'], 'createdAt', file),
        description: text(attributes['description'], 'description', file),
        icon: typeof icon === 'string' ? icon : undefined,
        keywords: Array.isArray(keywords) ? keywords : [],
        kind,
        order: Number.isNaN(order) ? 0 : order,
        title: text(attributes['title'], 'title', file),
        updatedAt: text(attributes['updatedAt'], 'updatedAt', file),
      },
      path,
    },
    locale,
  }
}
