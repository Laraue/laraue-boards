import type { DocEntry, DocNode, DocsLocale } from '../../shared/DocsContent.types'
import { flattenDocsTree } from './buildDocsTree'

// The address of a docs page on the site: /documentation/concepts/issues, /ru/documentation for the
// Russian home page.
export const docsPagePath = (locale: DocsLocale, path: string[]): string =>
  [locale === 'en' ? '' : `/${locale}`, 'documentation', ...path].join('/')

// The address of the page's markdown copy: the page's own address plus `.md`.
export const docsMarkdownPath = (locale: DocsLocale, path: string[]): string =>
  `${docsPagePath(locale, path)}.md`

// The markdown copy's address back to the page: /ru/documentation/concepts/issues.md ->
// ru, ['concepts', 'issues']. Anything else is not a markdown copy.
export const parseDocsMarkdownPath = (
  pathname: string,
): undefined | { locale: DocsLocale; path: string[] } => {
  const match = /^(?:\/(ru))?\/documentation((?:\/[a-z\d-]+)*)\.md$/.exec(pathname)
  if (!match) {
    return undefined
  }

  return {
    locale: match[1] === 'ru' ? 'ru' : 'en',
    path: (match[2] ?? '').split('/').filter(Boolean),
  }
}

// Links between the docs are written as site paths: /documentation/concepts/spaces#roles.
const rootRelativeLink = /\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g
const docsPagePattern = /^(?:\/ru)?\/documentation(?:\/[a-z\d-]+)*$/
// "## Where to save {#destination}": the explicit id is for the site's anchors, not for the reader.
const headingWithExplicitId = /^(#{1,6} .*?)\s*\{#[a-z\d][a-z\d-]*\}[ \t]*$/gm
// A video is written as an image of its YouTube link (see renderDocMarkdown); as text it is a link.
const videoImage = /!\[([^\]]*)\]\((https:\/\/(?:youtu\.be|(?:www\.)?youtube\.com)\/[^)\s]+)\)/g

// The page body made readable outside the site: links to other docs pages lead to their markdown
// copies, other site paths become full addresses.
const toPortableMarkdown = (body: string, siteUrl: string): string =>
  body
    .replaceAll(headingWithExplicitId, '$1')
    .replaceAll(videoImage, '[$1]($2)')
    .replaceAll(rootRelativeLink, (_, pathname: string, anchor = '') =>
      docsPagePattern.test(pathname)
        ? `](${siteUrl}${pathname}.md${anchor})`
        : `](${siteUrl}${pathname}${anchor})`,
    )

// One docs page as markdown, for `/documentation/<path>.md` and llms-full.txt.
export const renderDocMarkdownCopy = (
  entry: DocEntry,
  locale: DocsLocale,
  siteUrl: string,
): string =>
  [
    `# ${entry.meta.title}`,
    `> ${entry.meta.description}`,
    `Source: ${siteUrl}${docsPagePath(locale, entry.path)}`,
    toPortableMarkdown(entry.body.trim(), siteUrl),
  ].join('\n\n') + '\n'

const listItem = (node: DocNode, siteUrl: string): string =>
  `- [${node.meta.title}](${siteUrl}${docsMarkdownPath('en', node.path)}): ${node.meta.description}`

// Site pages outside the docs that an agent may need.
const optionalLinks = (siteUrl: string): string[] => [
  `- [Документация на русском](${siteUrl}${docsMarkdownPath('ru', [])}): the same docs in Russian`,
  `- [Laraue Boards vs Trello](${siteUrl}/compare/trello)`,
  `- [Laraue Boards vs Linear](${siteUrl}/compare/linear)`,
  `- [Terms of service](${siteUrl}/terms)`,
]

// `/llms.txt` (https://llmstxt.org): what Laraue Boards is and where each English docs page is, one
// `##` section per docs section, in reading order.
export const renderLlmsTxt = (root: DocNode, siteUrl: string): string => {
  const sections = root.children.filter((node) => node.meta.kind === 'section')
  const topLevelPages = root.children.filter((node) => node.meta.kind !== 'section')

  const blocks = [
    '# Laraue Boards',
    `> ${root.meta.description}`,
    'The links below lead to markdown copies of the documentation pages; the same address without ' +
      `\`.md\` is the page on the site. All the pages in one file: ${siteUrl}/llms-full.txt`,
    ['## Overview', ...[root, ...topLevelPages].map((node) => listItem(node, siteUrl))].join('\n'),
    ...sections.map((section) =>
      [
        `## ${section.meta.title}`,
        ...flattenDocsTree(section).map((node) => listItem(node, siteUrl)),
      ].join('\n'),
    ),
    ['## Optional', ...optionalLinks(siteUrl)].join('\n'),
  ]

  return blocks.join('\n\n') + '\n'
}

// `/llms-full.txt`: every English docs page in reading order, one after another.
export const renderLlmsFullTxt = (entries: DocEntry[], siteUrl: string): string =>
  entries.map((entry) => renderDocMarkdownCopy(entry, 'en', siteUrl)).join('\n---\n\n')

// The site's address without a trailing slash, so page paths can be appended to it.
export const siteOrigin = (url: string | undefined): string => (url ?? '').replace(/\/+$/, '')
