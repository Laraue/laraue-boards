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
import type { AppLayoutDeps, RoutableProblem } from '~/sections/common/app-layout/AppLayout.deps'
import AppLayoutContent from '~/sections/common/app-layout/components/AppLayoutContent.vue'
import { useAppLayoutTour } from '~/sections/common/app-layout/useAppLayoutTour'

const props = defineProps<{
  deps: AppLayoutDeps
  onLoggedOut: () => Promise<void> | void
  onOrganizationSwitched: () => void
  onViewProblem: (problem: RoutableProblem) => Promise<void> | void
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
const problem = computed(() =>
  query.data.value?.status === 'problem' ? query.data.value.problem : undefined,
)
const switchingOrganization = computed(() => problem.value?.kind === 'selecting-organization')

const routableProblem = computed(() =>
  problem.value?.kind === 'selecting-organization' ? undefined : problem.value,
)

if (routableProblem.value) {
  await props.onViewProblem(routableProblem.value)
}

watch(routableProblem, (next) => {
  if (next) {
    void props.onViewProblem(next)
  }
})

/** Nuxt runs the ready hook even after this layout is gone; a refresh from a dead instance
 * writes stale data into the shared `appLayoutDataKey` cache that the next one reads. */
let unmounted = false
onUnmounted(() => (unmounted = true))

onNuxtReady(async () => {
  if (unmounted) {
    return
  }
  if (!query.data.value) {
    await query.refresh()
    return
  }
  if (!switchingOrganization.value) {
    return
  }

  await query.refresh()
  if (query.data.value?.status === 'success') {
    props.onOrganizationSwitched()
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
