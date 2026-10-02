export type AssigneeSelectOption = {
  color: string
  initials: string
  isCurrentUser: boolean
  label: string
  value: string
}

export type AssigneeSelectDeps = {
  // Resolves with the options or rejects with an `ApiError`.
  loadAssignees: (input: {
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<AssigneeSelectOption[]>
}
