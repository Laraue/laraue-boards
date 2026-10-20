<template>
  <section class="agent-page">
    <QueryState
      :data="data"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: view }">
        <div class="agent-card">
          <span class="agent-badge"><IconTerminal2 /></span>

          <template v-if="state.answer === 'answered'">
            <div class="agent-intro">
              <h1>{{ state.allowed ? t('allowedTitle') : t('deniedTitle') }}</h1>
              <p class="muted">{{ state.allowed ? t('allowedText') : t('deniedText') }}</p>
            </div>
          </template>

          <p
            v-else-if="view.status === 'sign-in-required'"
            class="muted">
            {{ t('signingIn') }}
          </p>

          <template v-else-if="state.answer === 'expired' || view.status !== 'ready'">
            <div class="agent-intro">
              <h1>{{ t('expiredTitle') }}</h1>
              <p class="muted">{{ t('expiredText') }}</p>
              <code class="agent-command">boards-agent setup</code>
            </div>
          </template>

          <template v-else>
            <div class="agent-intro">
              <h1>{{ t('heading', { client: view.signIn.clientName }) }}</h1>
              <p class="muted">
                {{
                  t('allowText', {
                    client: view.signIn.clientName,
                    machine: view.signIn.machineName,
                  })
                }}
              </p>
            </div>

            <div class="agent-code">
              <span class="muted">{{ t('codeHint') }}</span>
              <strong data-testid="agent-user-code">{{ view.signIn.userCode }}</strong>
            </div>

            <div class="agent-organization">
              <span
                id="agent-organization-label"
                class="agent-label">
                {{ t('organization') }}
              </span>
              <BaseSelect
                v-if="view.organizations.length > 1"
                v-model="state.organizationId"
                aria-labelledby="agent-organization-label"
                full-width
                :options="
                  view.organizations.map((organization) => ({
                    label: organization.name,
                    value: organization.id,
                  }))
                "
                :placeholder="t('chooseOrganization')" />
              <strong v-else-if="view.organizations[0]">{{ view.organizations[0].name }}</strong>
            </div>

            <p class="muted agent-note">{{ t('keyNote', { keyName: view.signIn.keyName }) }}</p>

            <div class="agent-actions">
              <BaseButton
                :disabled="busy || !selectedOrganizationId(view.organizations)"
                variant="primary"
                @click="allow(selectedOrganizationId(view.organizations))">
                <IconLoader
                  v-if="approvePending"
                  class="spinning" />
                {{ t('allow') }}
              </BaseButton>
              <BaseButton
                :disabled="busy"
                @click="deny">
                {{ t('deny') }}
              </BaseButton>
            </div>
          </template>
        </div>
      </template>
    </QueryState>
  </section>
</template>

<script setup lang="ts">
import { IconLoader, IconTerminal2 } from '@tabler/icons-vue'

import type {
  AgentSignInAnswer,
  AgentSignInOrganization,
  AgentSignInPageDeps,
} from './AgentSignInPage.deps'

const props = defineProps<{
  code: string
  deps: AgentSignInPageDeps
  onSignInRequired: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    allow: 'Allow',
    allowedText: 'You can close this tab and return to the terminal.',
    allowedTitle: 'Agent connected',
    allowText:
      '{client} on {machine} wants to work on the issues you hand to it. Allow it for an organization:',
    chooseOrganization: 'Choose an organization',
    codeHint: 'Check that your terminal shows the same code',
    deniedText: 'The agent was not connected. You can close this tab.',
    deniedTitle: 'Access denied',
    deny: 'Deny',
    expiredText:
      'This link timed out or was already used. Run this command again in your terminal:',
    expiredTitle: 'This sign-in link has expired',
    heading: 'Connect {client}',
    keyNote:
      'It gets an API key named “{keyName}”, with the same access as you. You can revoke it any time under Account → API keys.',
    organization: 'Organization',
    signingIn: 'Opening the sign-in page…',
    title: 'Connect an agent',
  },
  ru: {
    allow: 'Разрешить',
    allowedText: 'Можно закрыть вкладку и вернуться в терминал.',
    allowedTitle: 'Агент подключён',
    allowText:
      '{client} на {machine} хочет работать над задачами, которые вы ему передадите. Разрешите ему доступ к организации:',
    chooseOrganization: 'Выберите организацию',
    codeHint: 'Проверьте, что в терминале тот же код',
    deniedText: 'Агент не подключён. Вкладку можно закрыть.',
    deniedTitle: 'Доступ запрещён',
    deny: 'Запретить',
    expiredText: 'Ссылка устарела или уже использована. Запустите эту команду в терминале ещё раз:',
    expiredTitle: 'Ссылка для входа устарела',
    heading: 'Подключение: {client}',
    keyNote:
      'Он получит API-ключ «{keyName}» с теми же правами, что у вас. Отозвать его можно в любой момент: Аккаунт → API-ключи.',
    organization: 'Организация',
    signingIn: 'Открываем страницу входа…',
    title: 'Подключение агента',
  },
})

const state = reactive<{
  allowed: boolean
  answer: AgentSignInAnswer | undefined
  organizationId: string
}>({ allowed: false, answer: undefined, organizationId: '' })

useHead({ title: t('title') })

const { data, message, pending, refresh } = await useApiQuery(
  () => `agent-sign-in:${props.code}`,
  (signal) => props.deps.view({ code: props.code, signal }),
)

// A signed-out visitor goes to the login page and comes back here with the same code.
watch(
  data,
  async (view) => {
    if (view?.status === 'sign-in-required') {
      await props.onSignInRequired()
    }
  },
  { immediate: true },
)

const { execute: approve, pending: approvePending } = useApiAction(props.deps.approve)
const { execute: reject, pending: denyPending } = useApiAction(props.deps.deny)

const busy = computed(() => approvePending.value || denyPending.value)

// With one organization there is nothing to choose.
const selectedOrganizationId = (organizations: AgentSignInOrganization[]): string =>
  organizations.length === 1 ? (organizations[0]?.id ?? '') : state.organizationId

const allow = async (organizationId: string): Promise<void> => {
  const result = await approve({ code: props.code, organizationId })
  if (result) {
    state.allowed = result.value === 'answered'
    state.answer = result.value
  }
}

const deny = async (): Promise<void> => {
  const result = await reject({ code: props.code })
  if (result) {
    state.allowed = false
    state.answer = result.value
  }
}
</script>

<style scoped>
.agent-page {
  display: grid;
  min-height: 100%;
  padding: var(--space-8) var(--space-4);
  place-items: center;
}

.agent-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-5);
  justify-items: center;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  width: min(460px, 100%);
}

.agent-badge {
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: grid;
  height: 56px;
  place-items: center;
  width: 56px;
}

.agent-badge .tabler-icon {
  height: 28px;
  width: 28px;
}

.agent-intro {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
}

.agent-code {
  background: var(--color-workspace);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  width: 100%;
}

.agent-code strong,
.agent-command {
  font-family: var(--font-family-mono);
  letter-spacing: 0.08em;
}

.agent-code strong {
  font-size: 1.5rem;
}

.agent-organization {
  display: grid;
  gap: var(--space-2);
  text-align: left;
  width: 100%;
}

.agent-label {
  font-weight: 600;
}

.agent-note {
  margin: 0;
}

.agent-actions {
  display: grid;
  gap: var(--space-2);
  width: 100%;
}

.spinning {
  animation: var(--animation-spin);
}
</style>
