import { assert, test } from 'vitest'

import { renderDocMarkdown } from './renderDocMarkdown'

test('gives second and third level headings an id and lists them', () => {
  const { headings, html } = renderDocMarkdown(
    '# Title\n\n## First part\n\n### Detail\n\n#### Deep',
  )

  assert.deepEqual(headings, [
    { id: 'first-part', level: 2, text: 'First part' },
    { id: 'detail', level: 3, text: 'Detail' },
  ])
  assert.include(html, '<h2 id="first-part">First part</h2>')
  assert.include(html, '<h1>Title</h1>')
  assert.include(html, '<h4>Deep</h4>')
})

test('makes ids of Russian headings and keeps repeated ones unique', () => {
  const { headings } = renderDocMarkdown('## Создание задачи\n\n## Создание задачи')

  assert.deepEqual(
    headings.map((heading) => heading.id),
    ['создание-задачи', 'создание-задачи-1'],
  )
})

test('takes the text of a heading with formatting without the markup', () => {
  const { headings } = renderDocMarkdown('## The `key` of an **issue**')

  assert.deepEqual(headings, [{ id: 'the-key-of-an-issue', level: 2, text: 'The key of an issue' }])
})

test('loads images lazily and escapes their attributes', () => {
  const { html } = renderDocMarkdown('![A "board"](https://example.com/board.jpg)')

  assert.include(
    html,
    '<img src="https://example.com/board.jpg" alt="A &quot;board&quot;" loading="lazy">',
  )
})

test('turns an image of a YouTube link into a poster that plays the video', () => {
  const { html } = renderDocMarkdown('![Video: replying "/save"](https://youtu.be/mpRBfDMMuNg)')

  assert.include(
    html,
    '<button type="button" class="doc-video" data-youtube-id="mpRBfDMMuNg" aria-label="Video: replying &quot;/save&quot;">',
  )
  assert.include(html, '<img src="https://i.ytimg.com/vi/mpRBfDMMuNg/maxresdefault.jpg" alt=""')
  assert.notInclude(html, 'youtube.com/embed')
})

test('reads the video id from a youtube.com watch link too', () => {
  const { html } = renderDocMarkdown('![Video](https://www.youtube.com/watch?v=mpRBfDMMuNg&t=5)')

  assert.include(html, 'data-youtube-id="mpRBfDMMuNg"')
})

test('keeps an image whose link only looks like a video as an image', () => {
  const { html } = renderDocMarkdown('![Logo](https://youtu.be.example.com/logo.png)')

  assert.include(html, '<img src="https://youtu.be.example.com/logo.png" alt="Logo" loading="lazy">')
})

test('lists the text of a heading as written, not as escaped in the HTML', () => {
  const { headings, html } = renderDocMarkdown(`## Who it's for\n\n## Q&A "quotes"`)

  assert.deepEqual(
    headings.map((heading) => heading.text),
    ["Who it's for", 'Q&A "quotes"'],
  )
  assert.deepEqual(
    headings.map((heading) => heading.id),
    ['who-it-s-for', 'q-a-quotes'],
  )
  // The HTML itself stays escaped.
  assert.include(html, '<h2 id="who-it-s-for">Who it&#39;s for</h2>')
})
