<template>
  <div
    v-if="page > 1 || hasNextPage"
    :aria-label="t('pagination')"
    class="pagination"
    role="navigation">
    <IconButton
      :disabled="page === 1"
      :label="t('previousPage')"
      @click="$emit('update:page', page - 1)">
      <IconChevronLeft />
    </IconButton>
    <input
      :aria-label="t('pageNumber')"
      min="1"
      type="number"
      :value="page"
      @change="changePage" />
    <IconButton
      :disabled="!hasNextPage"
      :label="t('nextPage')"
      @click="$emit('update:page', page + 1)">
      <IconChevronRight />
    </IconButton>
  </div>
</template>

<script setup lang="ts">
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'

defineProps<{ hasNextPage: boolean; page: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()
const { t } = useI18n({
  en: {
    nextPage: 'Next page',
    pageNumber: 'Page number',
    pagination: 'Pagination',
    previousPage: 'Previous page',
  },
  ru: {
    nextPage: 'Следующая страница',
    pageNumber: 'Номер страницы',
    pagination: 'Пагинация',
    previousPage: 'Предыдущая страница',
  },
})
const changePage = (event: Event) =>
  emit(
    'update:page',
    Math.max(1, Math.trunc(Number((event.target as HTMLInputElement).value)) || 1),
  )
</script>

<style scoped>
.pagination {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  margin-top: var(--space-4);
}

.pagination input {
  appearance: textfield;
  background: var(--color-feed);
  font-size: var(--font-size-small);
  font-variant-numeric: tabular-nums;
  height: var(--control-height-small);
  text-align: center;
  width: 64px;
}

.pagination input::-webkit-inner-spin-button,
.pagination input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

@media (max-width: 767px) {
  .pagination {
    justify-content: center;
  }
}
</style>
