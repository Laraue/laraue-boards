import { assert, test } from 'vitest'

import { diffLines } from './diffLines'

test('returns changed lines with word-level spans', () => {
  assert.deepEqual(
    diffLines('keep\nList Item three\nsame\nremove\nend', 'keep\nList Item four\nsame\nend'),
    [
      {
        kind: 'removed',
        oldLine: 2,
        spans: [
          { changed: false, text: 'List Item ' },
          { changed: true, text: 'three' },
        ],
        text: 'List Item three',
      },
      {
        kind: 'added',
        newLine: 2,
        spans: [
          { changed: false, text: 'List Item ' },
          { changed: true, text: 'four' },
        ],
        text: 'List Item four',
      },
      { kind: 'separator', text: 'unchanged lines' },
      { kind: 'removed', oldLine: 4, text: 'remove' },
    ],
  )
})

test('handles a prepended line', () => {
  assert.deepEqual(diffLines('Test 2', 'Test 1\r\nTest 2'), [
    { kind: 'added', newLine: 1, text: 'Test 1' },
  ])
})

test('handles an appended line', () => {
  assert.deepEqual(diffLines('Test 1\r\nTest 2', 'Test 1\r\nTest 2\r\nTest 3'), [
    { kind: 'added', newLine: 3, text: 'Test 3' },
  ])
})

test('handles a leading deletion with a repeated trailing line', () => {
  assert.deepEqual(diffLines('Test 1\r\nTest 2\r\nTest 3', 'Test 2\r\nTest 3\r\nTest 3'), [
    { kind: 'removed', oldLine: 1, text: 'Test 1' },
    { kind: 'separator', text: 'unchanged lines' },
    { kind: 'added', newLine: 3, text: 'Test 3' },
  ])
})

test('handles a removed Markdown block with an empty line', () => {
  assert.deepEqual(diffLines('Test 1\r\n\r\n## Test 2', ''), [
    { kind: 'removed', oldLine: 1, text: 'Test 1' },
    { kind: 'removed', oldLine: 2, text: '' },
    { kind: 'removed', oldLine: 3, text: '## Test 2' },
  ])
})
