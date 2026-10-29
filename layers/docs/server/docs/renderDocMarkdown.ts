import { Marked } from 'marked'

import type { DocHeading } from '../../shared/DocsContent.types'

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

// The text of a heading is taken from its rendered HTML, where marked has escaped it (it's -> it&#39;s).
const decodeEntities = (value: string): string =>
  value
    .replaceAll(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    // Last, so that "&amp;lt;" becomes "&lt;" and not "<".
    .replaceAll('&amp;', '&')

// The id of a YouTube video link: https://youtu.be/<id> or https://www.youtube.com/watch?v=<id>.
const youTubeVideoId = (href: string): string | undefined =>
  /^https:\/\/(?:youtu\.be\/|(?:www\.)?youtube\.com\/watch\?v=)([\w-]{11})(?:[?&#]|$)/.exec(
    href,
  )?.[1]

const playIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>'

// A video is written like an image of its YouTube link, ![Video: what it shows](https://youtu.be/<id>),
// and becomes its poster with a play button. DocsArticle swaps in the player on click, so the page
// loads nothing from YouTube's player until the reader asks for it.
const renderVideo = (id: string, title: string): string =>
  `<button type="button" class="doc-video" data-youtube-id="${id}" aria-label="${escapeHtml(title)}">` +
  `<img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" alt="" loading="lazy">` +
  `<span class="doc-video-play">${playIcon}</span>` +
  '</button>'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '')

// The docs are our own content, so the HTML is not sanitized. Second and third level headings get
// an id (for the "on this page" list and links to a section) and are returned alongside the HTML.
export const renderDocMarkdown = (body: string): { headings: DocHeading[]; html: string } => {
  const headings: DocHeading[] = []
  const usedIds = new Map<string, number>()

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ depth, tokens }) {
        const content = this.parser.parseInline(tokens)
        if (depth !== 2 && depth !== 3) {
          return `<h${depth}>${content}</h${depth}>\n`
        }

        const text = decodeEntities(content.replaceAll(/<[^>]*>/g, ''))
        const base = slugify(text) || 'section'
        const count = usedIds.get(base) ?? 0
        usedIds.set(base, count + 1)
        const id = count === 0 ? base : `${base}-${count}`
        headings.push({ id, level: depth, text })

        return `<h${depth} id="${id}">${content}</h${depth}>\n`
      },
      image({ href, text, title }) {
        const videoId = youTubeVideoId(href)
        if (videoId) {
          return renderVideo(videoId, text)
        }

        const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''

        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttribute} loading="lazy">`
      },
    },
  })

  return { headings, html: marked.parse(body, { async: false }) }
}
