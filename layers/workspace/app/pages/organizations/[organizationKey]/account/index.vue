<template>
  <MemberProfilePage
    :deps="deps"
    :on-updated="onUpdated" />
</template>

<script setup lang="ts">
import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createMemberProfilePageDeps } from '#layers/workspace/app/sections/organizations/account/profile/MemberProfilePage.deps.impl'
import MemberProfilePage from '#layers/workspace/app/sections/organizations/account/profile/MemberProfilePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { refreshAppLayoutData } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const { t } = useI18n({
  en: { profile: 'Profile' },
  ru: { profile: 'Профиль' },
})

const deps = createMemberProfilePageDeps(useApiClient({ onUnauthorized: useSignInRedirect() }))

// The header shows the user's name and color in the organization.
const onUpdated = async (): Promise<void> => {
  await refreshAppLayoutData()
}

useHead({ title: t('profile') })
</script>
