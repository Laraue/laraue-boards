<template>
  <div
    v-if="page > 1 || hasNextPage"
    :aria-label="t('pagination')"
    class="pagination"
    role="navigation">
    <button
      :aria-label="t('previousPage')"
      class="secondary"
      :disabled="page === 1"
      type="button"
      @click="$emit('update:page', page - 1)">
      <ChevronLeft />
    </button>
    <input
      :aria-label="t('pageNumber')"
      min="1"
      type="number"
      :value="page"
      @change="changePage" />
    <button
      :aria-label="t('nextPage')"
      class="secondary"
      :disabled="!hasNextPage"
      type="button"
      @click="$emit('update:page', page + 1)">
      <ChevronRight />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'

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
