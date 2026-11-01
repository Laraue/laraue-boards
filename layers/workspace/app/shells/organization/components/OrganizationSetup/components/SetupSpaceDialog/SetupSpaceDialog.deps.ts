export type SetupSpaceDialogDeps = {
  renameSpace: (input: {
    color: string
    key: string
    name: string
    newKey: string
  }) => Promise<void>
}
