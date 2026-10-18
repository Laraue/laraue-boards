export type IssueCardViewModel = {
  assigneeColor: string
  assigneeInitial: string
  assigneeName: string
  // An issue the user can read blocks this one and isn't completed yet.
  blocked: boolean
  issueKey: string
  time: string
  title: string
}
