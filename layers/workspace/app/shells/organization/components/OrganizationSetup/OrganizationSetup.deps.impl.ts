import type { ApiClient } from '#infrastructure/api/client'

import { createSetupDemoDataDialogDeps } from './components/SetupDemoDataDialog/SetupDemoDataDialog.deps.impl'
import { createSetupSpaceDialogDeps } from './components/SetupSpaceDialog/SetupSpaceDialog.deps.impl'
import type { OrganizationSetupDeps } from './OrganizationSetup.deps'

export const createOrganizationSetupDeps = (client: ApiClient): OrganizationSetupDeps => ({
  demoDataDialog: createSetupDemoDataDialogDeps(client),
  spaceDialog: createSetupSpaceDialogDeps(client),
})
