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
