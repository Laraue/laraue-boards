<!-- Page context, view tools and page actions. -->
<template>
  <header
    class="app-header page-header"
    :class="{ 'has-tools': $slots.tools }">
    <div class="page-header-start">
      <BaseIconButton
        class="page-header-menu"
        :label="t('openMenu')"
        @click="sidebarOpen = true">
        <IconMenu2 />
      </BaseIconButton>
      <!-- A phone has no room for the path, so it keeps the way back up it. -->
      <BaseIconButton
        v-if="back"
        class="page-header-back"
        :label="t('backTo', { page: back.label })"
        :to="back.to">
        <IconArrowLeft />
      </BaseIconButton>
      <div class="page-header-context">
        <nav
          v-if="parents?.length"
          :aria-label="t('breadcrumbs')"
          class="page-header-path">
          <template
            v-for="(parent, index) in parents"
            :key="parent.label">
            <NuxtLink
              class="page-header-crumb"
              :to="parent.to">
              <component
                :is="parent.icon"
                v-if="parent.icon"
                :style="{ color: parent.color }" />
              <span>{{ parent.label }}</span>
            </NuxtLink>
            <span
              v-if="index < parents.length - 1"
              aria-hidden="true">
              /
            </span>
          </template>
        </nav>
        <span
          v-if="parents?.length"
          aria-hidden="true"
          class="page-header-separator">
          /
        </span>
        <div class="page-header-title-row">
          <component
            :is="contextOnly ? 'p' : 'h1'"
            v-if="title"
            class="page-header-title">
            <component
              :is="icon"
              v-if="icon"
              :style="{ color: iconColor }" />
            <span>{{ title }}</span>
          </component>
          <slot name="title-actions" />
        </div>
      </div>
    </div>
    <div
      v-if="$slots.tools"
      class="page-header-tools">
      <slot name="tools" />
    </div>
    <div class="page-header-actions">
      <span
        v-if="$slots.actions"
        class="page-header-page-actions">
        <slot name="actions" />
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconMenu2 } from '@tabler/icons-vue'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

// An icon takes the color of what it stands for (a space, a board), or the text's without one.
const props = defineProps<{
  contextOnly?: boolean
  icon?: Component
  iconColor?: string
  parents?: Array<{ color?: string; icon?: Component; label: string; to: RouteLocationRaw }>
  title?: string
}>()

if (props.title !== undefined) {
  useHead({ title: () => props.title })
}
const back = computed(() => props.parents?.at(-1))
const sidebarOpen = useSidebarOpen()
const { t } = useI18n({
  en: {
    backTo: 'Back to {page}',
    breadcrumbs: 'Breadcrumbs',
    openMenu: 'Open menu',
  },
  ru: {
    backTo: 'Назад: {page}',
    breadcrumbs: 'Навигационная цепочка',
    openMenu: 'Открыть меню',
  },
})
</script>

<style scoped>
.page-header {
  align-items: center;
  backdrop-filter: none;
  background: var(--color-background);
  display: flex;
  flex: none;
  gap: var(--space-3);
  height: 55px;
  min-width: 0;
  padding: 0 var(--layout-content-padding, var(--space-6));
  top: 0;
}

.page-header-start {
  align-items: center;
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-context {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-path {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-body);
  gap: var(--space-2);
  min-width: 0;
}

.page-header-crumb,
.page-header-title {
  align-items: center;
  display: inline-flex;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-separator,
.page-header-path > span {
  color: var(--color-muted);
}

.page-header-crumb {
  color: inherit;
  text-decoration: none;
}

.page-header-crumb:is(:hover, :focus-visible) {
  color: var(--color-accent);
}

.page-header-crumb > span,
.page-header-title > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-header-crumb > svg {
  flex: none;
  height: 14px;
  width: 14px;
}

.page-header-title {
  color: var(--color-text);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  letter-spacing: normal;
  margin: 0;
}

.page-header-title > svg {
  flex: none;
  height: 14px;
  width: 14px;
}

.page-header-title-row,
.page-header-actions,
.page-header-page-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-actions {
  flex: none;
  margin-left: auto;
}

.page-header-tools {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-tools :deep(input[type='search']) {
  min-width: 0;
}

.page-header.has-tools .page-header-start {
  flex: 0 1 auto;
}

.page-header-start :deep(:is(.page-header-menu, .page-header-back)) {
  display: none;
}

@media (max-width: 1199px) {
  .page-header.has-tools {
    flex-wrap: wrap;
    height: auto;
    min-height: 55px;
    padding-block: var(--space-3);
    row-gap: var(--space-2);
  }

  .page-header-tools {
    flex-basis: 100%;
    order: 3;
  }

  .page-header.has-tools .page-header-start {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .page-header-start :deep(:is(.page-header-menu, .page-header-back)) {
    display: inline-flex;
  }

  .page-header-path,
  .page-header-separator {
    display: none;
  }
}
</style>
