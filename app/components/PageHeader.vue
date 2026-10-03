<!-- The bar at the top of an organization page: where the page is, its title and its own actions.
     Each page renders it, so its title and actions come with the page's own data. -->
<template>
  <header class="app-header page-header">
    <div class="page-header-start">
      <IconButton
        class="page-header-menu"
        :label="t('openMenu')"
        @click="sidebarOpen = true">
        <IconMenu2 />
      </IconButton>
      <!-- A phone has no room for the path, so it keeps the way back up it. -->
      <IconButton
        v-if="back"
        class="page-header-back"
        :label="t('backTo', { page: back.label })"
        :to="back.to">
        <IconArrowLeft />
      </IconButton>
      <nav
        v-if="parents?.length"
        :aria-label="t('breadcrumbs')"
        class="page-header-path">
        <template
          v-for="parent in parents"
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
          <span aria-hidden="true">/</span>
        </template>
      </nav>
      <h1
        v-if="title"
        class="page-header-crumb">
        <component
          :is="icon"
          v-if="icon"
          :style="{ color: iconColor }" />
        <span>{{ title }}</span>
      </h1>
      <!-- What can be made under the page, as the path's next step: "Board / + Add issue". -->
      <template v-if="$slots.default">
        <span
          aria-hidden="true"
          class="page-header-separator">
          /
        </span>
        <span class="page-header-next">
          <slot />
        </span>
      </template>
      <!-- What can be done to the page itself (settings, copy link): icon buttons by its title. -->
      <span
        v-if="$slots.actions"
        class="page-header-page-actions">
        <slot name="actions" />
      </span>
    </div>
    <div class="page-header-actions">
      <span class="page-header-preferences">
        <AppHeaderPreferences />
        <IconButton
          :label="t('yourAccount')"
          to="/account">
          <IconUserCircle />
        </IconButton>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconMenu2, IconUserCircle } from '@tabler/icons-vue'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

// An icon takes the color of what it stands for (a space, a board), or the text's without one.
const props = defineProps<{
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
    yourAccount: 'Your Laraue account',
  },
  ru: {
    backTo: 'Назад: {page}',
    breadcrumbs: 'Навигационная цепочка',
    openMenu: 'Открыть меню',
    yourAccount: 'Ваш аккаунт Laraue',
  },
})
</script>

<style scoped>
/* Out to the scrolling area's edges; a sticky box stops at its padding, so it moves past it. */
.page-header {
  background: var(--color-background);
  flex: none;
  margin: calc(-1 * var(--layout-content-padding, 0px))
    calc(-1 * var(--layout-content-padding, 0px)) var(--layout-content-padding, 0px);
  top: calc(-1 * var(--layout-content-padding, 0px));
}

.page-header-start {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.page-header-path {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex: 0 1 auto;
  font-size: var(--font-size-body);
  gap: var(--space-2);
  min-width: 0;
}

.page-header-path a {
  color: inherit;
  text-decoration: none;
}

.page-header-crumb {
  align-items: center;
  display: inline-flex;
  font-size: var(--font-size-body);
  font-weight: inherit;
  gap: var(--space-1);
  letter-spacing: normal;
  min-width: 0;
}

.page-header-crumb > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-header-crumb > svg {
  flex: none;
  height: 14px;
  width: 14px;
}

.page-header-path a:is(:hover, :focus-visible) {
  color: var(--color-text);
}

.page-header-separator {
  color: var(--color-muted);
}

.page-header-next {
  display: flex;
  flex: none;
  gap: var(--space-4);
}

.page-header-next :deep(:is(a, button)) {
  align-items: center;
  background: none;
  border: 0;
  color: var(--color-muted);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: var(--space-1);
  padding: 0;
  text-decoration: none;
  white-space: nowrap;
}

.page-header-next :deep(:is(a, button):is(:hover, :focus-visible):not(:disabled)) {
  color: var(--color-text);
}

.page-header-next :deep(:is(a, button):disabled) {
  cursor: default;
  opacity: 0.6;
  text-decoration: none;
}

.page-header-next :deep(:is(a, button) > svg) {
  height: 14px;
  width: 14px;
}

.page-header-page-actions {
  display: flex;
  flex: none;
  margin-left: var(--space-2);
}

.page-header-actions {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--space-2);
  margin-left: auto;
}

.page-header-preferences {
  display: contents;
}

/* :deep: the classes land on IconButton's button, which is not this component's own element. */
.page-header-start :deep(:is(.page-header-menu, .page-header-back)) {
  display: none;
}

@media (max-width: 767px) {
  .page-header {
    padding-left: var(--space-2);
  }

  .page-header-start :deep(:is(.page-header-menu, .page-header-back)) {
    display: inline-flex;
  }

  /* Language, theme and the account come with the menu instead. */
  .page-header-preferences {
    display: none;
  }

  /* Which leaves the right edge to the page's own actions. */
  .page-header-start {
    flex: 1;
  }

  .page-header-page-actions {
    margin-left: auto;
  }

  /* A phone has room for the title only. */
  .page-header-path {
    display: none;
  }

  /* A phone keeps the actions' icons. */
  .page-header-next :deep(.btn-label) {
    display: none;
  }
}
</style>
