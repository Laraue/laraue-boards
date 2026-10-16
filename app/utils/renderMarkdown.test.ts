import { assert, test } from 'vitest'

import { renderMarkdown } from '~/utils/renderMarkdown'

test('renders markdown to html', () => {
  assert.include(renderMarkdown('# Title'), '<h1>Title</h1>')
  assert.include(renderMarkdown('**bold**'), '<strong>bold</strong>')
  assert.include(renderMarkdown('first\nsecond'), '<p>first<br>second</p>')
})

test('only renders fenced blocks as code', () => {
  assert.notInclude(renderMarkdown('    indented text'), '<pre>')
  assert.include(renderMarkdown('```ts\nconst value = 1\n```'), '<pre><code class="language-ts">')
})

test('strips embedded scripts and event handlers', () => {
  const html = renderMarkdown('<script>alert(1)</script><img src=x onerror="alert(1)">')
  assert.notInclude(html, '<script')
  assert.notInclude(html, 'onerror')
})

test('opens web links in a new tab', () => {
  const html = renderMarkdown('see https://example.com and [docs](/docs)')
  assert.include(html, '<a href="https://example.com" target="_blank" rel="noopener noreferrer">')
  assert.include(html, '<a href="/docs">')
})

test('strips javascript: urls', () => {
  assert.notInclude(renderMarkdown('[click](javascript:alert(1))'), 'javascript:')
})
