import type { SetupDemoDataDialogDeps } from './components/SetupDemoDataDialog/SetupDemoDataDialog.deps'
import type { SetupSpaceDialogDeps } from './components/SetupSpaceDialog/SetupSpaceDialog.deps'

export type OrganizationSetupDeps = {
  demoDataDialog: SetupDemoDataDialogDeps
  spaceDialog: SetupSpaceDialogDeps
}
