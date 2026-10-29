import { assert, test } from 'vitest'

import { issueSourceField, mapIssueSource } from './issueSource'

test('maps how an issue was created to its source mark', () => {
  assert.deepEqual(mapIssueSource('Web', null), { keyName: null, kind: 'web' })
  assert.isNull(mapIssueSource(undefined, undefined))
  assert.deepEqual(mapIssueSource('Telegram', null), { keyName: null, kind: 'telegram' })
  assert.deepEqual(mapIssueSource('Mcp', 'My laptop'), { keyName: 'My laptop', kind: 'mcp' })
  assert.deepEqual(mapIssueSource('Agent', 'Claude Code agent (dev-laptop)'), {
    keyName: 'Claude Code agent (dev-laptop)',
    kind: 'agent',
  })
})

test('leaves the source field out when the API sends none', () => {
  assert.deepEqual(issueSourceField(undefined, undefined), {})
  assert.deepEqual(issueSourceField('Mcp', null), { source: { keyName: null, kind: 'mcp' } })
})
