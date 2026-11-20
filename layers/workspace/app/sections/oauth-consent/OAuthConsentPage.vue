<template>
  <section class="oauth-page">
    <div
      v-if="errorView"
      class="oauth-card">
      <span class="oauth-badge"><IconPlug /></span>
      <div class="oauth-intro">
        <h1>{{ t(errorView.title) }}</h1>
        <p class="muted">{{ t(errorView.text) }}</p>
      </div>
    </div>

    <QueryState
      v-else
      :data="data"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: view }">
        <div class="oauth-card">
          <span class="oauth-badge"><IconPlug /></span>

          <p
            v-if="state.redirecting"
            class="muted">
            {{ t('redirecting') }}
          </p>

          <p
            v-else-if="view.status === 'sign-in-required'"
            class="muted">
            {{ t('signingIn') }}
          </p>

          <template v-else-if="state.expired || view.status !== 'ready'">
            <div class="oauth-intro">
              <h1>{{ t('expiredTitle') }}</h1>
              <p class="muted">{{ t('expiredText') }}</p>
            </div>
          </template>

          <template v-else>
            <div class="oauth-intro">
              <h1>{{ t('heading', { client: view.consent.clientName }) }}</h1>
              <p class="muted">
                {{
                  t('allowText', {
                    client: view.consent.clientName,
                    host: view.consent.clientHost,
                  })
                }}
              </p>
            </div>

            <div class="oauth-organization">
              <span
                id="oauth-organization-label"
                class="oauth-label">
                {{ t('organization') }}
              </span>
              <BaseSelect
                v-if="view.organizations.length > 1"
                v-model="state.organizationId"
                aria-labelledby="oauth-organization-label"
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

            <p class="muted oauth-note">{{ t('keyNote', { keyName: view.consent.keyName }) }}</p>

            <div class="oauth-actions">
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
                <IconX />
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
import { IconLoader, IconPlug, IconX } from '@tabler/icons-vue'
import { computed, reactive, watch } from 'vue'

import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'

import type {
  OAuthConsentAnswer,
  OAuthConsentOrganization,
  OAuthConsentPageDeps,
} from './OAuthConsentPage.deps'

const props = defineProps<{
  deps: OAuthConsentPageDeps
  // Set when the server refused the app before asking the user: 'unknown_client', 'client_unavailable'
  // or 'invalid_redirect_uri'.
  error: string
  onRedirect: (url: string) => Promise<void> | void
  onSignInRequired: () => Promise<void> | void
  requestId: string
}>()

const { t } = useI18n({
  en: {
    allow: 'Allow',
    allowText:
      '{client} ({host}) wants to work with your Boards issues on your behalf. Allow it for an organization:',
    chooseOrganization: 'Choose an organization',
    clientUnavailableText: 'Try connecting it again in a minute.',
    clientUnavailableTitle: 'Could not reach the app',
    deny: 'Deny',
    expiredText: 'It timed out or was already used. Start connecting again from the app.',
    expiredTitle: 'This sign-in link has expired',
    heading: 'Connect {client}',
    invalidLinkText: 'Start connecting again from the app.',
    invalidLinkTitle: 'This link is not valid',
    keyNote:
      'It gets an API key named “{keyName}”, with the same access as you. You can revoke it any time under Organization profile → API keys.',
    organization: 'Organization',
    redirecting: 'Taking you back to the app…',
    signingIn: 'Opening the sign-in page…',
    title: 'Connect an app',
    unknownClientText: 'Boards connects only the apps it knows, such as Claude and ChatGPT.',
    unknownClientTitle: 'This app can’t connect to Boards',
  },
  ru: {
    allow: 'Разрешить',
    allowText:
      '{client} ({host}) хочет работать с вашими задачами в Boards от вашего имени. Разрешите ему доступ к организации:',
    chooseOrganization: 'Выберите организацию',
    clientUnavailableText: 'Попробуйте подключить его ещё раз через минуту.',
    clientUnavailableTitle: 'Не удалось связаться с приложением',
    deny: 'Запретить',
    expiredText:
      'Время вышло или ссылка уже использована. Начните подключение в приложении заново.',
    expiredTitle: 'Ссылка для входа устарела',
    heading: 'Подключение: {client}',
    invalidLinkText: 'Начните подключение в приложении заново.',
    invalidLinkTitle: 'Ссылка недействительна',
    keyNote:
      'Приложение получит API-ключ «{keyName}» с теми же правами, что у вас. Отозвать его можно в любой момент: Профиль в организации → API-ключи.',
    organization: 'Организация',
    redirecting: 'Возвращаем вас в приложение…',
    signingIn: 'Открываем страницу входа…',
    title: 'Подключение приложения',
    unknownClientText:
      'Boards подключает только известные ему приложения, например Claude и ChatGPT.',
    unknownClientTitle: 'Это приложение нельзя подключить к Boards',
  },
})

useHead({ title: t('title') })

// An error from the server, or a link with neither a request nor an error, is shown without asking the API.
const errorView = computed(() => {
  if (props.error === 'unknown_client') {
    return { text: 'unknownClientText', title: 'unknownClientTitle' } as const
  }
  if (props.error === 'client_unavailable') {
    return { text: 'clientUnavailableText', title: 'clientUnavailableTitle' } as const
  }
  if (props.error || !props.requestId) {
    return { text: 'invalidLinkText', title: 'invalidLinkTitle' } as const
  }
  return undefined
})

const state = reactive<{
  expired: boolean
  organizationId: string
  redirecting: boolean
}>({ expired: false, organizationId: '', redirecting: false })

const { data, message, pending, refresh } = await useApiQuery(
  () => `oauth-consent:${props.requestId}`,
  (signal) =>
    errorView.value
      ? Promise.resolve({ status: 'not-found' } as const)
      : props.deps.view({ requestId: props.requestId, signal }),
)

// A signed-out visitor goes to the login page and comes back here with the same request.
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

const busy = computed(() => approvePending.value || denyPending.value || state.redirecting)

// With one organization there is nothing to choose.
const selectedOrganizationId = (organizations: OAuthConsentOrganization[]): string =>
  organizations.length === 1 ? (organizations[0]?.id ?? '') : state.organizationId

// Either way the answer goes back to the app, which tells the user what happened.
const finish = async (answer: OAuthConsentAnswer): Promise<void> => {
  if (answer.status === 'expired') {
    state.expired = true
    return
  }
  state.redirecting = true
  await props.onRedirect(answer.redirectUrl)
}

const allow = async (organizationId: string): Promise<void> => {
  const result = await approve({ organizationId, requestId: props.requestId })
  if (result) {
    await finish(result.value)
  }
}

const deny = async (): Promise<void> => {
  const result = await reject({ requestId: props.requestId })
  if (result) {
    await finish(result.value)
  }
}
</script>

<style scoped>
.oauth-page {
  display: grid;
  min-height: 100%;
  padding: var(--space-8) var(--space-4);
  place-items: center;
}

.oauth-card {
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

.oauth-badge {
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: grid;
  height: 56px;
  place-items: center;
  width: 56px;
}

.oauth-badge .tabler-icon {
  height: 28px;
  width: 28px;
}

.oauth-intro {
  display: grid;
  gap: var(--space-2);
  justify-items: center;
}

.oauth-organization {
  display: grid;
  gap: var(--space-2);
  text-align: left;
  width: 100%;
}

.oauth-label {
  font-weight: 600;
}

.oauth-note {
  margin: 0;
}

.oauth-actions {
  display: grid;
  gap: var(--space-2);
  width: 100%;
}

.spinning {
  animation: var(--animation-spin);
}
</style>
