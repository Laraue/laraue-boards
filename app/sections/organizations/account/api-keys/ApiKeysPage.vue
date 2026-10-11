<template>
  <section class="api-keys-section">
    <BaseSectionHeader :title="t('apiKeys')" />
    <form
      class="api-key-form"
      @submit.prevent="createKey">
      <BaseField
        v-slot="{ id }"
        class="api-key-name"
        :label="t('name')">
        <input
          :id="id"
          v-model="name"
          autocomplete="off"
          name="api-key-name"
          :placeholder="t('namePlaceholder')"
          required
          type="text" />
      </BaseField>
      <BaseButton
        :disabled="busy"
        type="submit"
        variant="primary">
        {{ creating ? t('creating') : t('create') }}
      </BaseButton>
    </form>

    <div
      v-if="rawKey"
      class="created-key"
      role="status">
      <strong>{{ t('created') }}</strong>
      <p class="muted">{{ t('copyWarning') }}</p>
      <div class="created-key-value">
        <code>{{ rawKey }}</code>
        <BaseButton @click="copyKey">
          <IconCheck v-if="copied" />
          <IconCopy v-else />
          {{ copied ? t('copied') : t('copy') }}
        </BaseButton>
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
        <BaseList v-if="pageData.keys.length">
          <BaseListRow
            v-for="key in pageData.keys"
            :key="key.id">
            {{ key.name }} <code>{{ key.keyPrefix }}…</code>
            <template #description>
              {{ t('createdAt', { date: formatDateTime(key.createdAt) }) }}
              <template v-if="key.lastUsedAt">
                · {{ t('lastUsedAt', { date: formatDateTime(key.lastUsedAt) }) }}
              </template>
            </template>
            <template #trailing>
              <span
                v-if="key.revokedAt"
                class="muted">
                {{ t('revoked') }}
              </span>
              <BaseButton
                v-else
                :disabled="busy"
                @click="revokeKey(key.id)">
                {{ t('revoke') }}
              </BaseButton>
            </template>
          </BaseListRow>
        </BaseList>
        <BaseEmptyState
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
import { IconCheck, IconCopy } from '@tabler/icons-vue'

import type { ApiKeysPageDeps } from './ApiKeysPage.deps'

const props = defineProps<{ deps: ApiKeysPageDeps }>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    apiKeys: 'API keys',
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
    apiKeys: 'API-ключи',
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
} = await useApiQuery(
  () => `account-api-keys:${page.value}`,
  (signal) => props.deps.view({ page: page.value, signal }),
)

const {
  execute: create,
  message: createMessage,
  pending: creating,
} = useApiAction(props.deps.create)
const {
  execute: revoke,
  message: revokeMessage,
  pending: revoking,
} = useApiAction(props.deps.revoke)
const busy = computed(() => pending.value || creating.value || revoking.value)

const createKey = async () => {
  const created = await create({ name: name.value.trim() })
  if (created) {
    name.value = ''
    rawKey.value = created.value.rawKey
    copied.value = false
    await refresh()
  }
}
const revokeKey = async (id: string) => {
  if (
    (await confirm({ action: t('revoke'), danger: true, title: t('revokeConfirm') })) &&
    (await revoke({ id }))
  ) {
    await refresh()
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

.api-key-name {
  max-width: 360px;
  width: 100%;
}

.created-key {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
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

.base-list-row code,
.created-key-value code {
  font-family: var(--font-family-mono);
}

@media (max-width: 767px) {
  .api-key-form,
  .created-key-value {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
