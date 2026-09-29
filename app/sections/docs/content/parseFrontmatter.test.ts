import { assert, test } from 'vitest'

import { parseFrontmatter } from './parseFrontmatter'

test('reads text and list values and returns the body', () => {
  const { attributes, body } = parseFrontmatter(
    '---\ntitle: Quick start — first issue\nkeywords: [kanban board, telegram, tasks]\norder: 2\n---\nHello\n',
  )

  assert.deepEqual(attributes, {
    keywords: ['kanban board', 'telegram', 'tasks'],
    order: '2',
    title: 'Quick start — first issue',
  })
  assert.equal(body, 'Hello\n')
})

test('keeps colons inside a value', () => {
  const { attributes } = parseFrontmatter('---\ntitle: Setup: step one\n---\nBody')

  assert.equal(attributes['title'], 'Setup: step one')
})

test('ignores a byte order mark and Windows line endings', () => {
  const { attributes, body } = parseFrontmatter('﻿---\r\ntitle: A\r\n---\r\nBody')

  assert.equal(attributes['title'], 'A')
  assert.equal(body, 'Body')
})

test('treats a text without frontmatter as the body', () => {
  assert.deepEqual(parseFrontmatter('# Just text'), { attributes: {}, body: '# Just text' })
})
