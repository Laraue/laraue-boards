<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="member-permissions-page">
        <BaseSectionHeader
          :description="page.member.isOwner ? t('ownerReadonly') : undefined"
          :title="`${page.member.name} ${t('permissions')}`">
          <template #leading>
            <AppBackLink
              :label="t('backToMembers')"
              :to="organizationRoutes.permissions()" />
          </template>
        </BaseSectionHeader>
        <MemberPermissionsForm
          :error="submitMessage ?? null"
          :on-submit="submitForm"
          :saved="saved"
          :submitting="submitting"
          :view-model="page" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import MemberPermissionsForm from '#layers/workspace/app/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'
import type {
  MemberPermissions,
  MemberPermissionsPageDeps,
} from '#layers/workspace/app/sections/organizations/permissions/member-permissions/MemberPermissionsPage.deps'
import AppBackLink from '#layers/workspace/app/shared/components/AppBackLink.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: MemberPermissionsPageDeps
  memberId: string
  onSaved: () => Promise<void> | void
  organizationRoutes: OrganizationRoutes
}>()

const { t } = useI18n({
  en: {
    backToMembers: 'Back to members',
    loadError: 'Could not load member permissions',
    loading: 'Loading member permissions…',
    memberPermissions: 'Member permissions',
    ownerReadonly: 'Owner permissions are read-only.',
    permissions: 'permissions',
  },
  ru: {
    backToMembers: 'Назад к участникам',
    loadError: 'Не удалось загрузить права участника',
    loading: 'Загрузка прав участника…',
    memberPermissions: 'Права участника',
    ownerReadonly: 'Права владельца доступны только для чтения.',
    permissions: 'права',
  },
})

const { data, message, pending, refresh } = await useApiQuery(
  () => `member-permissions:${props.memberId}`,
  (signal) => props.deps.view({ memberId: props.memberId, signal }),
)

useHead({
  title: computed(() =>
    data.value ? `${data.value.member.name} ${t('permissions')}` : t('memberPermissions'),
  ),
})

const saved = ref(false)

const {
  execute: submit,
  message: submitMessage,
  pending: submitting,
} = useApiAction(props.deps.update)

const submitForm = async (permissions: MemberPermissions): Promise<void> => {
  saved.value = false
  if (await submit({ memberId: props.memberId, permissions })) {
    await props.onSaved()
    saved.value = true
  }
}
</script>

<style scoped>
.member-permissions-page {
  overflow: visible;
}
</style>
