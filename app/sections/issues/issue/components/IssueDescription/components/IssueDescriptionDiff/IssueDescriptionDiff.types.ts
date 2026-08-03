export type IssueDescriptionDiffLine = {
  kind: 'added' | 'removed' | 'separator'
  newLine?: number
  oldLine?: number
  spans?: IssueDescriptionDiffSpan[]
  text: string
}

export type IssueDescriptionDiffSpan = {
  changed: boolean
  text: string
}
