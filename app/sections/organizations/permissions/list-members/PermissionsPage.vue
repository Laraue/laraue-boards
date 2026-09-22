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
        <div class="invitation-card">
          <div class="invitation-heading">
            <span class="invitation-icon"><TicketCheck /></span>
            <div>
              <strong>{{ t('invitePeople') }}</strong>
              <p class="muted">{{ t('inviteDescription') }}</p>
            </div>
            <button
              :aria-label="regenerating ? t('creatingLink') : t('createLink')"
              class="regenerate-link"
              :disabled="regenerating"
              type="button"
              @click="regenerate">
              <RefreshCw />
              <span class="btn-label">
                {{ regenerating ? t('creatingLinkProgress') : t('createLink') }}
              </span>
            </button>
          </div>
          <div class="invitation-link">
            <input
              :aria-label="t('invitationLink')"
              readonly
              :value="invitationUrl"
              @focus="($event.target as HTMLInputElement).select()" />
            <button
              class="secondary"
              :class="{ copied: state.copied }"
              type="button"
              @click="copyInvitation">
              <Check v-if="state.copied" />
              <Copy v-else />
              {{ state.copied ? t('copied') : t('copyLink') }}
            </button>
          </div>
          <p
            v-if="state.copyError || regenerateMessage"
            aria-live="polite"
            class="form-error">
            {{ regenerateMessage || state.copyError }}
          </p>
        </div>
        <p class="section-label members-label">{{ t('members') }}</p>
        <div class="member-list">
          <NuxtLink
            v-for="member in page.members"
            :key="member.id"
            :to="organizationRoutes.memberPermissions(member.id)">
            <span
              class="avatar"
              :style="{ background: member.color }">
              {{ member.initials }}
            </span>
            <span class="member-name">
              <strong>{{ member.name }}</strong>
              <small class="muted">
                {{ member.isOwner ? t('owner') : member.isAdmin ? t('admin') : t('member') }}
              </small>
            </span>
            <ChevronRight />
          </NuxtLink>
        </div>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { Check, ChevronRight, Copy, RefreshCw, TicketCheck } from '@lucide/vue'

import type { PermissionsPageDeps } from '~/sections/organizations/permissions/list-members/PermissionsPage.deps'

const props = defineProps<{ deps: PermissionsPageDeps }>()

const { t } = useI18n({
  en: {
    admin: 'Admin',
    copied: 'Copied',
    copyError: 'Could not copy the link. Select and copy it manually.',
    copyLink: 'Copy link',
    createLink: 'Create a new link',
    creatingLink: 'Creating new link',
    creatingLinkProgress: 'Creating new link…',
    invitationLink: 'Invitation link',
    inviteDescription: 'Anyone with this link can join the organization.',
    invitePeople: 'Invite people',
    loadError: 'Could not load permissions',
    loading: 'Loading permissions…',
    member: 'Member',
    members: 'Members',
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
    creatingLink: 'Создание новой ссылки',
    creatingLinkProgress: 'Создание новой ссылки…',
    invitationLink: 'Ссылка-приглашение',
    inviteDescription: 'Любой пользователь с этой ссылкой сможет присоединиться к организации.',
    invitePeople: 'Пригласить участников',
    loadError: 'Не удалось загрузить права доступа',
    loading: 'Загрузка прав доступа…',
    member: 'Участник',
    members: 'Участники',
    owner: 'Владелец',
    permissions: 'Права доступа',
    regenerateConfirm: 'Создать новую ссылку-приглашение? Текущая ссылка перестанет работать.',
  },
})

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('permissions') })

const { data, message, pending, refresh } = await useQuery(
  'organization-permissions',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
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
} = useAction(props.deps.regenerateJoinCode, {
  onSuccess: (code) => {
    state.copied = false
    state.copyError = ''
    state.joinCode = code
  },
})
const regenerate = (): void => {
  if (confirm(t('regenerateConfirm'))) {
    void regenerateJoinCode()
  }
}
</script>

<style scoped>
.invitation-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  margin-top: var(--space-6);
  padding: var(--space-4);
}

.invitation-heading,
.invitation-link,
.regenerate-link {
  align-items: center;
  display: flex;
}

.invitation-heading {
  gap: var(--space-3);
}

.invitation-heading > div {
  flex: 1;
  min-width: 0;
}

.invitation-icon {
  background: var(--color-accent-soft);
  border-radius: var(--radius-control);
  color: var(--color-accent);
  display: grid;
  height: 40px;
  place-items: center;
  width: 40px;
}

.invitation-link {
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.invitation-link input {
  font-family: var(--font-family-mono);
  text-overflow: ellipsis;
}

.invitation-link .secondary {
  flex: none;
}

.invitation-link .copied {
  border-color: var(--color-success);
  color: var(--color-success);
}

.regenerate-link {
  background: none;
  border: 0;
  color: var(--color-muted);
  flex: none;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  margin-left: auto;
  padding: 0;
}

.regenerate-link:hover:not(:disabled) {
  color: var(--color-text);
}

.regenerate-link .lucide {
  height: 14px;
  width: 14px;
}

.members-label {
  margin: var(--space-6) 0 var(--space-3);
}

.member-list {
  display: grid;
  gap: var(--space-2);
}

.member-list a {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto 1fr auto;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.member-list a:hover {
  background: var(--color-hover);
}

.member-list a:active {
  translate: 0 var(--press-offset);
}

.member-list a > .lucide:last-child {
  color: var(--color-muted);
}

.member-name {
  display: grid;
  min-width: 0;
}

.member-name > * {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .regenerate-link .btn-label {
    display: none;
  }

  .invitation-link {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
