<template>
  <AppLayoutContent
    v-if="data"
    :feedback-deps="deps.feedback"
    :logging-out="loggingOut"
    :on-logout="logout"
    :organization-routes="organizationRoutes"
    :view-model="data">
    <slot />
  </AppLayoutContent>
  <PageLoadState
    v-else-if="query.pending.value || switchingOrganization"
    error-text=""
    :loading="true"
    :loading-text="t('loadingWorkspace')" />
  <PageLoadState
    v-else
    error-text=""
    :loading="true"
    :loading-text="t('loadingOrganizations')" />
</template>

<script setup lang="ts">
import { provide, ref, computed, onUnmounted, watch } from 'vue'

import { clearNuxtData, navigateTo, onNuxtReady, useAsyncData, useHead, useSeoMeta } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import PageLoadState from '#layers/workspace/app/shared/components/PageLoadState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { sidebarOpenKey } from '#layers/workspace/app/shared/composables/useSidebarOpen'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'
import type {
  AppLayoutDeps,
  RoutableProblem,
} from '#layers/workspace/app/shells/organization/AppLayout.deps'
import AppLayoutContent from '#layers/workspace/app/shells/organization/components/AppLayoutContent.vue'
import { appLayoutDataKey } from '#layers/workspace/app/shells/organization/useAppLayoutData'
import { useAppLayoutTour } from '#layers/workspace/app/shells/organization/useAppLayoutTour'

const props = defineProps<{
  deps: AppLayoutDeps
  onOrganizationSwitched: () => void
  onViewProblem: (problem: RoutableProblem) => Promise<void> | void
  organizationKey: string
  organizationRoutes: OrganizationRoutes
}>()
// Telegram must read its signed launch hash before the router normalizes it.
useHead({
  script: [{ key: 'telegram-mini-app', src: 'https://telegram.org/js/telegram-web-app.js?61' }],
})

// The app's pages are private. The server already sends X-Robots-Tag (see the layer's
// nuxt.config); the tag repeats it in the page for crawlers and tools that read only the HTML.
useSeoMeta({ robots: 'noindex, nofollow' })
const sidebarOpen = ref(false)
provide(sidebarOpenKey, sidebarOpen)
const { execute: executeLogout, pending: loggingOut } = useApiAction(props.deps.logout)
const logout = async () => {
  if (!loggingOut.value && (await executeLogout())) {
    clearNuxtData()
    await navigateTo('/login')
  }
}
const { t } = useI18n({
  en: {
    loadingOrganizations: 'Loading organizations…',
    loadingWorkspace: 'Loading workspace…',
  },
  ru: {
    loadingOrganizations: 'Загрузка организаций…',
    loadingWorkspace: 'Загрузка организации…',
  },
})
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
  problem.value?.kind === 'selecting-organization' || problem.value?.kind === 'signed-out'
    ? undefined
    : problem.value,
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
</script>
