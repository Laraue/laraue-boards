export type AssigneeSelectOption = {
  color: string
  initials: string
  isCurrentUser: boolean
  label: string
  value: string
}

export type AssigneeSelectDeps = {
  loadAssignees: (input: {
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<AssigneeSelectOption[]>
}
