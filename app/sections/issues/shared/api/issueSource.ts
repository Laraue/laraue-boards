import type { components } from '#infrastructure/api/generated'
import type { IssueSource } from '~/components/issue-source-icon/IssueSourceIcon.types'
import { assertNever } from '~/utils/assertNever'

// An API older than the source sends nothing: null, no mark.
export const mapIssueSource = (
  createdVia: components['schemas']['IssueCreatedVia'] | undefined,
  keyName: null | string | undefined,
): IssueSource | null => {
  switch (createdVia) {
    case undefined:
      return null
    case 'Web':
      return { keyName: null, kind: 'web' }
    case 'Telegram':
      return { keyName: null, kind: 'telegram' }
    case 'Mcp':
      return { keyName: keyName ?? null, kind: 'mcp' }
    case 'Agent':
      return { keyName: keyName ?? null, kind: 'agent' }
    default:
      return assertNever(createdVia)
  }
}

// For view models where the source is an optional field: absent when the API sends none.
export const issueSourceField = (
  createdVia: components['schemas']['IssueCreatedVia'] | undefined,
  keyName: null | string | undefined,
): { source?: IssueSource } => {
  const source = mapIssueSource(createdVia, keyName)
  return source ? { source } : {}
}
