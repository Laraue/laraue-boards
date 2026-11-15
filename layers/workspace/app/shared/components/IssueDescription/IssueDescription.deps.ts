export type IssueDescriptionDeps = {
  summarizeContent: (input: {
    content: string
  }) => Promise<{ content: string; title: null | string }>
}
