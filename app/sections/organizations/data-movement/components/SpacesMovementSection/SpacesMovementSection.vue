<template>
  <section class="movement-section">
    <div>
      <h3>{{ t('spaces') }}</h3>
      <p class="muted">{{ t('description') }}</p>
    </div>
    <AppBulkBar
      :action-label="t('moveSpaces')"
      :count="selectedIds.length"
      :on-action="() => openDialog(selectedIds)"
      :on-clear="() => state.selected.clear()" />
    <BaseList v-if="movableSpaces.length">
      <BaseListRow
        v-for="space in movableSpaces"
        :key="space.key">
        <template #leading>
          <input
            :aria-label="`${t('select')} ${space.name}`"
            :checked="state.selected.has(space.key)"
            type="checkbox"
            @change="toggle(space.key)" />
          <SpaceIcon :style="{ color: space.color }" />
        </template>
        {{ space.name }}
        <template #trailing>
          <BaseIconButton
            :label="`${t('move')} ${space.name}`"
            :tooltip="t('moveSpace')"
            @click="openDialog([space.key])">
            <IconArrowsLeftRight />
          </BaseIconButton>
        </template>
      </BaseListRow>
    </BaseList>
    <p
      v-else
      class="empty">
      {{ t('empty') }}
    </p>

    <MoveSpacesDialog
      ref="dialog"
      :deps="deps.dialog"
      :ids="state.dialogIds"
      :on-moved="onMoved" />
  </section>
</template>

<script setup lang="ts">
import { IconArrowsLeftRight } from '@tabler/icons-vue'

import { SpaceIcon } from '~/constants/icons'
import type { DataMovementPageData } from '~/sections/organizations/data-movement/DataMovementPage.deps'

import MoveSpacesDialog from './components/MoveSpacesDialog/MoveSpacesDialog.vue'
import type { SpacesMovementSectionDeps } from './SpacesMovementSection.deps'

const props = defineProps<{
  deps: SpacesMovementSectionDeps
  onMoved: () => Promise<void> | void
  spaces: DataMovementPageData['spaces']
}>()

const { t } = useI18n({
  en: {
    description: 'Move spaces to another organization.',
    empty: 'No movable spaces.',
    move: 'Move',
    moveSpace: 'Move space',
    moveSpaces: 'Move spaces',
    select: 'Select',
    spaces: 'Spaces',
  },
  ru: {
    description: 'Перемещайте пространства в другую организацию.',
    empty: 'Нет доступных для перемещения пространств.',
    move: 'Переместить',
    moveSpace: 'Переместить пространство',
    moveSpaces: 'Переместить пространства',
    select: 'Выбрать',
    spaces: 'Пространства',
  },
})

const dialog = useTemplateRef('dialog')

const state = reactive({
  dialogIds: [] as string[],
  selected: new Set<string>(),
})

const movableSpaces = computed(() => props.spaces.filter((space) => !space.isDefault))

const selectedIds = computed(() =>
  movableSpaces.value.map(({ key }) => key).filter((key) => state.selected.has(key)),
)

const toggle = (id: string) => {
  if (state.selected.has(id)) {
    state.selected.delete(id)
  } else {
    state.selected.add(id)
  }
}

const openDialog = (ids: string[]) => {
  state.dialogIds = ids
  dialog.value?.open()
}
</script>

<style scoped>
.movement-section {
  display: grid;
  gap: var(--space-2);
}

.movement-section h3,
.movement-section p {
  margin: 0;
}

.movement-section h3 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}
</style>
