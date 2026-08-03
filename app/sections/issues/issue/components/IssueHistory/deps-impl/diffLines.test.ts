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
