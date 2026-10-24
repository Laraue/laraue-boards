<template>
  <section class="api-keys-section">
    <BaseSectionHeader :title="t('apiKeys')">
      <template #actions>
        <BaseButton
          variant="primary"
          @click="dialog?.open()">
          <IconPlus />
          {{ t('create') }}
        </BaseButton>
      </template>
    </BaseSectionHeader>
    <BaseDialog
      ref="dialog"
      :close-label="t('close')"
      :title="t('create')"
      @submit="createKey">
      <BaseField
        v-slot="{ id }"
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
      <p
        v-if="createMessage"
        class="form-error">
        {{ createMessage }}
      </p>
      <template #actions>
        <BaseButton @click="dialog?.close()">{{ t('cancel') }}</BaseButton>
        <BaseButton
          :loading="creating"
          type="submit"
          variant="primary">
          {{ t('create') }}
        </BaseButton>
      </template>
    </BaseDialog>

    <div
      v-if="rawKey"
      class="created-key"
      role="status">
      <strong>{{ t('created') }}</strong>
      <p class="muted">{{ t('copyWarning') }}</p>
      <div class="created-key-value">
        <code>{{ rawKey }}</code>
        <BaseIconButton
          :label="copied ? t('copied') : t('copy')"
          :tooltip="copied ? t('copied') : t('copy')"
          @click="copyKey">
          <IconCheck v-if="copied" />
          <IconCopy v-else />
        </BaseIconButton>
      </div>
      <p
        v-if="copyError"
        class="form-error">
        {{ copyError }}
      </p>
    </div>

    <BaseCheckbox
      class="show-revoked"
      :model-value="showRevoked"
      @update:model-value="setShowRevoked">
      {{ t('showRevoked') }}
    </BaseCheckbox>

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
            {{ key.name }}
            <code>{{ key.keyPrefix }}…</code>
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
import { IconCheck, IconCopy, IconPlus } from '@tabler/icons-vue'

import type { ApiKeysPageDeps } from './ApiKeysPage.deps'

const props = defineProps<{ deps: ApiKeysPageDeps }>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    apiKeys: 'API keys',
    cancel: 'Cancel',
    close: 'Close',
    copied: 'Copied',
    copy: 'Copy',
    copyError: 'Could not copy the key. Select and copy it manually.',
    copyWarning: 'This key is shown only once. Save it somewhere safe.',
    create: 'Create key',
    created: 'API key created',
    createdAt: 'Created {date}',
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
    showRevoked: 'Show revoked keys',
  },
  ru: {
    apiKeys: 'API-ключи',
    cancel: 'Отмена',
    close: 'Закрыть',
    copied: 'Скопировано',
    copy: 'Копировать',
    copyError: 'Не удалось скопировать ключ. Выделите и скопируйте его вручную.',
    copyWarning: 'Ключ показывается только один раз. Сохраните его в безопасном месте.',
    create: 'Создать ключ',
    created: 'API-ключ создан',
    createdAt: 'Создан {date}',
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
    showRevoked: 'Показывать отозванные ключи',
  },
})

const dialog = useTemplateRef('dialog')
const page = ref(1)
const showRevoked = ref(false)
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
  () => `account-api-keys:${page.value}:${showRevoked.value}`,
  (signal) => props.deps.view({ includeRevoked: showRevoked.value, page: page.value, signal }),
)
useViewRefresh(refresh)

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
    dialog.value?.close()
    name.value = ''
    rawKey.value = created.value.rawKey
    copied.value = false
    await refresh()
  }
}
// The other list has its own pages: start it from the first.
const setShowRevoked = (value: boolean) => {
  showRevoked.value = value
  page.value = 1
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

// A failed create shows in its dialog.
const sectionMessage = computed(() => revokeMessage.value || queryMessage.value)
</script>

<style scoped>
.api-keys-section {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.show-revoked {
  justify-self: start;
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
  flex: 1;
  overflow-wrap: anywhere;
  padding: var(--space-2);
}

.base-list-row code,
.created-key-value code {
  font-family: var(--font-family-mono);
}
</style>
