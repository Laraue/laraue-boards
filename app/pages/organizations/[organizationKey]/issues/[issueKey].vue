<template>
  <IssuePage
    :deps="deps"
    :issue-key="issueKey"
    :lazy="false"
    :on-back="onBack"
    :on-dirty-change="setDirty"
    :on-saved="onSaved" />
</template>

<script setup lang="ts">
import { createIssuePageDeps } from '~/sections/issues/issue/deps-impl'
import type { IssuePageSavedIssue } from '~/sections/issues/issue/IssuePage.types'
import IssuePage from '~/sections/issues/issue/IssuePage.vue'

const route = useRoute('organizations-organizationKey-issues-issueKey')
const issueKey = computed(() => String(route.params.issueKey))
const dirty = ref(false)
useUnsavedChangesWarning(dirty)
const setDirty = (value: boolean) => (dirty.value = value)
const router = useRouter()
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createIssuePageDeps(client)
const onSaved = async (issue: IssuePageSavedIssue): Promise<void> => {
  if (issue.issueKey !== issueKey.value) {
    await router.replace(organizationRoutes.issue(issue.issueKey))
  }
}
const onBack = async (): Promise<void> => {
  const back = window.history.state?.back
  if (typeof back === 'string' && back.startsWith('/')) {
    router.back()
    return
  }
  await navigateTo(organizationRoutes.issues())
}
</script>
