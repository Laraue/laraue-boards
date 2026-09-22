<template>
  <section class="api-keys-section">
    <form
      class="api-key-form"
      @submit.prevent="createKey">
      <label>
        {{ t('name') }}
        <input
          v-model="name"
          autocomplete="off"
          name="api-key-name"
          :placeholder="t('namePlaceholder')"
          required
          type="text" />
      </label>
      <button
        class="primary"
        :disabled="busy"
        type="submit">
        {{ creating ? t('creating') : t('create') }}
      </button>
    </form>

    <div
      v-if="rawKey"
      class="created-key"
      role="status">
      <strong>{{ t('created') }}</strong>
      <p class="muted">{{ t('copyWarning') }}</p>
      <div class="created-key-value">
        <code>{{ rawKey }}</code>
        <button
          class="secondary"
          type="button"
          @click="copyKey">
          <Check v-if="copied" />
          <Copy v-else />
          {{ copied ? t('copied') : t('copy') }}
        </button>
      </div>
      <p
        v-if="copyError"
        class="form-error">
        {{ copyError }}
      </p>
    </div>

    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="sectionMessage"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: pageData }">
        <div
          v-if="pageData.keys.length"
          class="api-key-list">
          <article
            v-for="key in pageData.keys"
            :key="key.id"
            class="api-key-card">
            <div class="api-key-info">
              <strong>{{ key.name }}</strong>
              <code>{{ key.keyPrefix }}…</code>
              <small class="muted">
                {{ t('createdAt', { date: formatDateTime(key.createdAt) }) }}
                <template v-if="key.lastUsedAt">
                  · {{ t('lastUsedAt', { date: formatDateTime(key.lastUsedAt) }) }}
                </template>
              </small>
            </div>
            <div class="api-key-actions">
              <span
                v-if="key.revokedAt"
                class="muted">
                {{ t('revoked') }}
              </span>
              <button
                v-else
                class="secondary danger"
                :disabled="busy"
                type="button"
                @click="revokeKey(key.id)">
                {{ t('revoke') }}
              </button>
            </div>
          </article>
        </div>
        <AppEmptyState
          v-else
          :hint="t('emptyHint')"
          :title="t('empty')" />

        <PaginationControl
          :has-next-page="pageData.hasNextPage"
          :page="page"
          @update:page="page = $event" />
      </template>
    </QueryState>
  </section>
</template>

<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'

import type { ApiKeysPageDeps } from './ApiKeysPage.deps'

const props = defineProps<{ deps: ApiKeysPageDeps }>()

const { t } = useI18n({
  en: {
    copied: 'Copied',
    copy: 'Copy',
    copyError: 'Could not copy the key. Select and copy it manually.',
    copyWarning: 'This key is shown only once. Save it somewhere safe.',
    create: 'Create key',
    created: 'API key created',
    createdAt: 'Created {date}',
    creating: 'Creating…',
    empty: 'No API keys yet',
    emptyHint: 'Create a key to access the API from an external tool.',
    lastUsedAt: 'last used {date}',
    loadError: 'Could not load API keys',
    loading: 'Loading API keys…',
    name: 'Name',
    namePlaceholder: 'For example, CI',
    revoke: 'Revoke',
    revokeConfirm: 'Revoke this API key?',
    revoked: 'Revoked',
  },
  ru: {
    copied: 'Скопировано',
    copy: 'Копировать',
    copyError: 'Не удалось скопировать ключ. Выделите и скопируйте его вручную.',
    copyWarning: 'Ключ показывается только один раз. Сохраните его в безопасном месте.',
    create: 'Создать ключ',
    created: 'API-ключ создан',
    createdAt: 'Создан {date}',
    creating: 'Создание…',
    empty: 'API-ключей пока нет',
    emptyHint: 'Создайте ключ для доступа к API из внешнего инструмента.',
    lastUsedAt: 'последнее использование {date}',
    loadError: 'Не удалось загрузить API-ключи',
    loading: 'Загрузка API-ключей…',
    name: 'Название',
    namePlaceholder: 'Например, CI',
    revoke: 'Отозвать',
    revokeConfirm: 'Отозвать этот API-ключ?',
    revoked: 'Отозван',
  },
})

const page = ref(1)
const name = ref('')
const rawKey = ref('')
const copied = ref(false)
const copyError = ref('')
const { formatDateTime } = useFormatters()
const {
  data,
  message: queryMessage,
  pending,
  refresh,
} = await useQuery(
  'account-api-keys',
  (_nuxtApp, { signal }) => props.deps.view({ page: page.value, signal }),
  { watch: [page] },
)

const {
  execute: create,
  message: createMessage,
  pending: creating,
} = useAction(props.deps.create, {
  onSuccess: async ({ rawKey: key }) => {
    name.value = ''
    rawKey.value = key
    copied.value = false
    await refresh()
  },
})
const {
  execute: revoke,
  message: revokeMessage,
  pending: revoking,
} = useAction(props.deps.revoke, {
  onSuccess: async () => {
    await refresh()
  },
})
const busy = computed(() => pending.value || creating.value || revoking.value)

const createKey = () => void create({ name: name.value.trim() })
const revokeKey = (id: string) => {
  if (confirm(t('revokeConfirm'))) {
    void revoke({ id })
  }
}
const copyKey = async () => {
  copyError.value = ''
  try {
    await navigator.clipboard.writeText(rawKey.value)
    copied.value = true
  } catch {
    copyError.value = t('copyError')
  }
}

const sectionMessage = computed(
  () => createMessage.value || revokeMessage.value || queryMessage.value,
)
</script>

<style scoped>
.api-keys-section {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.api-key-form {
  align-items: end;
  display: flex;
  gap: var(--space-3);
}

.api-key-form label {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  max-width: 360px;
  width: 100%;
}

.created-key,
.api-key-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
}

.created-key {
  display: grid;
  gap: var(--space-2);
}

.created-key p {
  margin: 0;
}

.created-key-value {
  align-items: center;
  display: flex;
  gap: var(--space-3);
}

.created-key-value code {
  background: var(--color-soft);
  border-radius: var(--radius-control);
  overflow-wrap: anywhere;
  padding: var(--space-2);
}

.api-key-list {
  display: grid;
  gap: var(--space-3);
}

.api-key-card,
.api-key-info,
.api-key-actions {
  align-items: center;
  display: flex;
}

.api-key-card {
  gap: var(--space-4);
  justify-content: space-between;
}

.api-key-info {
  flex-wrap: wrap;
  gap: var(--space-2);
}

.api-key-info code,
.created-key-value code {
  font-family: var(--font-family-mono);
}

.api-key-info small {
  flex-basis: 100%;
}

.api-key-actions {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .api-key-form,
  .api-key-card,
  .created-key-value {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
