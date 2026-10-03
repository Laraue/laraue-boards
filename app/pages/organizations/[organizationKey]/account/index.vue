<template>
  <MemberProfilePage
    :deps="deps"
    :on-updated="onUpdated" />
</template>

<script setup lang="ts">
import { createMemberProfilePageDeps } from '~/sections/organizations/account/profile/MemberProfilePage.deps.impl'
import MemberProfilePage from '~/sections/organizations/account/profile/MemberProfilePage.vue'

const { t } = useI18n({
  en: { profile: 'Profile' },
  ru: { profile: 'Профиль' },
})

const deps = createMemberProfilePageDeps(useApiClient())

// The header shows the user's name and color in the organization.
const onUpdated = async (): Promise<void> => {
  await refreshAppLayoutData()
}

usePageTitle(t('profile'))
</script>
