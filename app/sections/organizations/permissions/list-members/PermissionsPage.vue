<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="permissions-page">
        <BaseSectionHeader :title="t('permissions')">
          <template #actions>
            <!-- Invitations are rare next to reading the list, so the link waits behind a button. -->
            <BasePopover
              align="end"
              class="invitation">
              <template #trigger="{ toggle }">
                <BaseButton
                  variant="primary"
                  @click="toggle">
                  <IconUserPlus />
                  {{ t('invite') }}
                </BaseButton>
              </template>
              <div class="invitation-panel">
                <div>
                  <strong>{{ t('invitePeople') }}</strong>
                  <p class="muted">{{ t('inviteDescription') }}</p>
                </div>
                <div class="invitation-link">
                  <input
                    :aria-label="t('invitationLink')"
                    readonly
                    :value="invitationUrl"
                    @focus="($event.target as HTMLInputElement).select()" />
                  <BaseIconButton
                    :label="state.copied ? t('copied') : t('copyLink')"
                    :tooltip="state.copied ? t('copied') : t('copyLink')"
                    @click="copyInvitation">
                    <IconCheck v-if="state.copied" />
                    <IconCopy v-else />
                  </BaseIconButton>
                  <BaseIconButton
                    :disabled="regenerating"
                    :label="t('createLink')"
                    :tooltip="t('createLink')"
                    @click="regenerate">
                    <IconRefresh />
                  </BaseIconButton>
                </div>
                <p
                  v-if="state.copyError || regenerateMessage"
                  aria-live="polite"
                  class="form-error">
                  {{ regenerateMessage || state.copyError }}
                </p>
              </div>
            </BasePopover>
          </template>
        </BaseSectionHeader>
        <BaseList>
          <BaseListRow
            v-for="member in page.members"
            :key="member.id"
            :to="organizationRoutes.memberPermissions(member.id)">
            <template #leading>
              <BaseAvatar
                :color="member.color"
                :initials="member.initials"
                size="sm" />
            </template>
            {{ member.name }}
            <!-- Only the roles above a plain member are marked. -->
            <BaseBadge
              v-if="member.isOwner || member.isAdmin"
              class="member-role"
              :variant="member.isOwner ? 'accent' : 'neutral'">
              {{ member.isOwner ? t('owner') : t('admin') }}
            </BaseBadge>
          </BaseListRow>
        </BaseList>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { IconCheck, IconCopy, IconRefresh, IconUserPlus } from '@tabler/icons-vue'

import type { PermissionsPageDeps } from '~/sections/organizations/permissions/list-members/PermissionsPage.deps'

const props = defineProps<{ deps: PermissionsPageDeps }>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    admin: 'Admin',
    copied: 'Copied',
    copyError: 'Could not copy the link. Select and copy it manually.',
    copyLink: 'Copy link',
    createLink: 'Create a new link',
    invitationLink: 'Invitation link',
    invite: 'Invite',
    inviteDescription: 'Anyone with this link can join the organization.',
    invitePeople: 'Invite people',
    loadError: 'Could not load permissions',
    loading: 'Loading permissions…',
    owner: 'Owner',
    permissions: 'Permissions',
    regenerateConfirm: 'Create a new invitation link? The current link will stop working.',
  },
  ru: {
    admin: 'Администратор',
    copied: 'Скопировано',
    copyError: 'Не удалось скопировать ссылку. Выделите и скопируйте её вручную.',
    copyLink: 'Копировать ссылку',
    createLink: 'Создать новую ссылку',
    invitationLink: 'Ссылка-приглашение',
    invite: 'Пригласить',
    inviteDescription: 'Любой пользователь с этой ссылкой сможет присоединиться к организации.',
    invitePeople: 'Пригласить участников',
    loadError: 'Не удалось загрузить права доступа',
    loading: 'Загрузка прав доступа…',
    owner: 'Владелец',
    permissions: 'Права доступа',
    regenerateConfirm: 'Создать новую ссылку-приглашение? Текущая ссылка перестанет работать.',
  },
})

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('permissions') })

const { data, message, pending, refresh } = await useApiQuery(
  'organization-permissions',
  (signal) => props.deps.view({ signal }),
)

const state = reactive({
  copied: false,
  copyError: '',
  joinCode: data.value?.joinCode ?? '',
})
watch(data, (page) => {
  state.joinCode = page?.joinCode ?? ''
})

const requestUrl = useRequestURL()
const invitationUrl = computed(
  () => `${requestUrl.origin}/join/${encodeURIComponent(state.joinCode)}`,
)

let copiedTimer: ReturnType<typeof setTimeout> | undefined
const copyInvitation = async (): Promise<void> => {
  state.copyError = ''
  try {
    await navigator.clipboard.writeText(invitationUrl.value)
    state.copied = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (state.copied = false), 2000)
  } catch {
    state.copyError = t('copyError')
  }
}
onBeforeUnmount(() => clearTimeout(copiedTimer))

const {
  execute: regenerateJoinCode,
  message: regenerateMessage,
  pending: regenerating,
} = useApiAction(props.deps.regenerateJoinCode)
const regenerate = async (): Promise<void> => {
  if (!(await confirm({ title: t('regenerateConfirm') }))) {
    return
  }
  const regenerated = await regenerateJoinCode()
  if (regenerated) {
    state.copied = false
    state.copyError = ''
    state.joinCode = regenerated.value
  }
}
</script>

<style scoped>
.permissions-page {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.invitation {
  --base-popover-width: 24rem;
}

.invitation-panel {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
}

.invitation-panel p {
  margin: var(--space-1) 0 0;
}

.invitation-link {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.invitation-link input {
  font-family: var(--font-family-mono);
  min-width: 0;
  text-overflow: ellipsis;
}

.member-role {
  margin-left: var(--space-2);
}
</style>
