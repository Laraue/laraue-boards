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
  <PageLoadState
    v-else
    error-text=""
    :loading="true"
    loading-text="Loading organizations…" />
</template>

<script setup lang="ts">
import type { AppLayoutDeps } from '~/sections/common/app-layout/AppLayout.deps'
import AppLayoutContent from '~/sections/common/app-layout/components/AppLayoutContent.vue'
import { useAppLayoutTour } from '~/sections/common/app-layout/useAppLayoutTour'

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
useAppLayoutTour(data, props.deps.tour)
const errorCode = computed(() =>
  query.data.value?.status === 'error' ? query.data.value.code : undefined,
)
const switchingOrganization = computed(() => errorCode.value === 409)

const redirectForError = (code: number) => (code === 401 ? '/' : '/organizations')

if (errorCode.value !== undefined && !switchingOrganization.value) {
  await navigateTo(redirectForError(errorCode.value))
}

watch(errorCode, (code) => {
  if (code !== undefined && code !== 409) {
    void navigateTo(redirectForError(code))
  }
})

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

const { execute: executeLogout, pending: loggingOut } = useAction(props.deps.logout, {
  onSuccess: props.onLoggedOut,
})
const logout = () => {
  if (!loggingOut.value) {
    void executeLogout()
  }
}
</script>
