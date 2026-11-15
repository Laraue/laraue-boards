<template>
  <IssueDetails
    :deps="deps"
    :issue-key="issueKey"
    :lazy="false"
    :on-back="onBack"
    :on-dirty-change="setDirty"
    :on-saved="onSaved"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { navigateTo, useRoute, useRouter } from '#app'
import type { IssueDetailsSavedIssue } from '#layers/workspace/app/shared/components/IssueDetails/IssueDetails.deps'
import { createIssueDetailsDeps } from '#layers/workspace/app/shared/components/IssueDetails/IssueDetails.deps.impl'
import IssueDetails from '#layers/workspace/app/shared/components/IssueDetails/IssueDetails.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { useUnsavedChangesWarning } from '#layers/workspace/app/shared/composables/useUnsavedChangesWarning'

const route = useRoute('organizations-organizationKey-issues-issueKey')
const issueKey = computed(() => String(route.params.issueKey))
const dirty = ref(false)
useUnsavedChangesWarning(dirty)
const setDirty = (value: boolean) => (dirty.value = value)
const router = useRouter()
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createIssueDetailsDeps(client)
const onSaved = async (issue: IssueDetailsSavedIssue): Promise<void> => {
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
