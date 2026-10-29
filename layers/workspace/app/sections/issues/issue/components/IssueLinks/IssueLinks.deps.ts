import type { IssueLinkRelation } from '#layers/workspace/app/sections/issues/shared/model/IssueLinks.types'

// `notFound`: no issue with that key in the organization, or one the user cannot see.
export type IssueLinkAddResult = { outcome: 'added' } | { outcome: 'notFound' }

// An issue the user can link to, suggested while they type.
export type IssueLinkCandidate = {
  issueKey: string
  title: string
}

// `failed`: the search request failed; the dialog says so in the list instead of a toast.
export type IssueSearchResult =
  | { issues: IssueLinkCandidate[]; outcome: 'found' }
  | { outcome: 'failed' }

export type IssueLinksDeps = {
  add: (input: {
    issueKey: string
    otherIssueKey: string
    relation: IssueLinkRelation
  }) => Promise<IssueLinkAddResult>
  remove: (input: { issueKey: string; otherIssueKey: string }) => Promise<void>
  // Issues matching the typed text - by key ("BRD-12") or by words in the title or description.
  searchIssues: (input: { search: string; signal?: AbortSignal }) => Promise<IssueSearchResult>
}
