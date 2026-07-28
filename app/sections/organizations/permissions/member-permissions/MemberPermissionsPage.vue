<template>
  <QueryState
    :data="data"
    error-title="Could not load member permissions"
    loading-text="Loading member permissions…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="member-permissions-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to members"
              :to="organizationRoutes.permissions()" />
            <ShieldCheck class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>{{ page.member.name }} permissions</h1>
            </div>
          </div>
        </div>
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
import { ShieldCheck } from '@lucide/vue'

import MemberPermissionsForm from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'
import type { MemberPermissionsPageDeps } from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.deps'
import type { MemberPermissions } from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.types'

const props = defineProps<{
  deps: MemberPermissionsPageDeps
  memberId: string
  onSaved: () => Promise<void> | void
}>()

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useQuery(
  () => `member-permissions:${props.memberId}`,
  (_nuxtApp, { signal }) => props.deps.view({ memberId: props.memberId, signal }),
  { watch: [() => props.memberId] },
)

useHead({
  title: computed(() =>
    data.value ? `${data.value.member.name} permissions` : 'Member permissions',
  ),
})

const saved = ref(false)

const {
  execute: submit,
  message: submitMessage,
  pending: submitting,
} = useAction<[MemberPermissions], true>(
  (permissions) => props.deps.update({ memberId: props.memberId, permissions }),
  {
    onSuccess: async () => {
      await props.onSaved()
      saved.value = true
    },
  },
)

const submitForm = async (permissions: MemberPermissions): Promise<void> => {
  saved.value = false
  await submit(permissions)
}
</script>

<style scoped>
.member-permissions-page {
  overflow: visible;
}
</style>
