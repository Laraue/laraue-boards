<!-- The organization setup (BRD-293), shown to the owner until it is finished: the space window, then the demo
     data window. Without a space to name it starts at the demo data. Closing a window postpones the setup to the
     next visit. -->
<template>
  <SetupSpaceDialog
    v-if="state.step === 'space' && setup.space"
    :deps="deps.spaceDialog"
    :on-next="showDemoData"
    :space="setup.space" />
  <SetupDemoDataDialog
    v-else
    :default-space-key="state.spaceKey"
    :deps="deps.demoDataDialog"
    :on-completed="onCompleted"
    :spaces="spaces" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'

import type { AppLayoutData } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import SetupDemoDataDialog from './components/SetupDemoDataDialog/SetupDemoDataDialog.vue'
import SetupSpaceDialog from './components/SetupSpaceDialog/SetupSpaceDialog.vue'
import type { OrganizationSetupDeps } from './OrganizationSetup.deps'

const props = defineProps<{
  deps: OrganizationSetupDeps
  onCompleted: () => Promise<void> | void
  // Reloads the layout, so the sidebar and the demo data window show the new name.
  onSpaceRenamed: () => Promise<void> | void
  setup: NonNullable<AppLayoutData['setup']>
  spaces: AppLayoutData['spaces']
}>()

const state = reactive({
  spaceKey: props.setup.space?.key ?? '',
  step: 'space' as 'demo' | 'space',
})

const showDemoData = async ({ key, renamed }: { key: string; renamed: boolean }) => {
  if (renamed) {
    await props.onSpaceRenamed()
  }
  state.spaceKey = key
  state.step = 'demo'
}
</script>
