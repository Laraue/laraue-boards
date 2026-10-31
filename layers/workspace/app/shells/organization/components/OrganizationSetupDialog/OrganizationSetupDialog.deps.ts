import type { StatusCategory } from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.types'

/** Demo issues go to a new board with these statuses, or to the space's backlog. */
export type DemoDataTarget = 'backlog' | 'board'

export type DemoData = {
  boardName: string
  // Each issue's status is an index in `statuses`; it is ignored for the backlog.
  issues: Array<{ statusIndex: number; title: string }>
  spaceKey: string
  statuses: Array<{ category: StatusCategory; name: string }>
  target: DemoDataTarget
}

export type OrganizationSetupDialogDeps = {
  // Creates the board (for `board`) and the issues through the regular endpoints. They count toward the plan's
  // monthly issues like any other.
  addDemoData: (input: DemoData) => Promise<void>
  complete: (input: { demoDataAdded: boolean }) => Promise<void>
  renameSpace: (input: {
    color: string
    key: string
    name: string
    newKey: string
  }) => Promise<void>
}
