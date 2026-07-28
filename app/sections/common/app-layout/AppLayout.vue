<template>
  <AppLayoutContent
    v-if="data"
    :on-logout="logout"
    :view-model="data">
    <slot />
  </AppLayoutContent>
  <PageLoadState
    v-else-if="query.pending.value || switchingOrganization"
    error-text=""
    :loading="true"
    loading-text="Loading workspace…" />
  <AppErrorState
    v-else
    code="Workspace error"
    :message="errorMessage"
    :title="errorTitle">
    <button
      v-if="accessDenied"
      class="primary"
      type="button"
      @click="logout">
      <LogIn />
      Sign in again
    </button>
    <button
      class="secondary"
      type="button"
      @click="refresh">
      <RefreshCw />
      Try again
    </button>
  </AppErrorState>
</template>

<script setup lang="ts">
import { LogIn, RefreshCw } from '@lucide/vue'

import type { AppLayoutDeps } from '~/sections/common/app-layout/AppLayout.deps'
import AppLayoutContent from '~/sections/common/app-layout/components/AppLayoutContent.vue'

const props = defineProps<{
  deps: AppLayoutDeps
  onLoggedOut: () => Promise<void> | void
  organizationKey: string
}>()
const query = await useAsyncData(
  appLayoutDataKey,
  (_nuxtApp, { signal }) => props.deps.view({ organizationKey: props.organizationKey, signal }),
  { watch: [() => props.organizationKey] },
)
const data = computed(() =>
  query.data.value?.status === 'success' ? query.data.value.data : undefined,
)
const errorCode = computed(() =>
  query.data.value?.status === 'error' ? query.data.value.code : undefined,
)
const switchingOrganization = computed(() => errorCode.value === 409)
const accessDenied = computed(() => errorCode.value === 403)
const refresh = () => void query.refresh()

onNuxtReady(async () => {
  if (!query.data.value) {
    await query.refresh()
    return
  }
  if (!switchingOrganization.value) {
    return
  }

  await query.refresh()
  if (query.data.value?.status === 'success') {
    window.location.reload()
  }
})

const errorTitle = computed(() => {
  switch (errorCode.value) {
    case 403:
      return 'Sign in required'
    case 409:
      return 'Switching organization'
    case 404:
      return 'Workspace not found'
    default:
      return 'Something went wrong'
  }
})

const errorMessage = computed(() => {
  switch (errorCode.value) {
    case 403:
      return 'Your session has expired. Sign in and select your organization again.'
    case 404:
      return 'The workspace may have moved or is no longer available.'
    default:
      return 'Workspace is unavailable. Check your connection and try again.'
  }
})
const { execute: executeLogout, pending: loggingOut } = useAction(props.deps.logout, {
  onSuccess: props.onLoggedOut,
})
const logout = () => {
  if (!loggingOut.value) {
    void executeLogout()
  }
}
</script>
