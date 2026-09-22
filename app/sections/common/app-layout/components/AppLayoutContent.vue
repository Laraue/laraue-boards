<template>
  <div class="shell">
    <aside :class="{ open: state.sidebarOpen }">
      <NuxtLink
        class="logo"
        :to="organizationRoutes.issues()">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <div
        class="organization"
        @click="state.sidebarOpen = false">
        <NuxtLink
          :aria-label="`${t('switchOrganization')}. ${t('currentOrganization')}: ${viewModel.organization.name}`"
          class="organization-select"
          data-tour="organization-switcher"
          :title="t('switchOrganization')"
          to="/organizations">
          <span
            class="entity-avatar"
            :style="{ background: viewModel.organization.color }">
            {{ viewModel.organization.initial }}
          </span>
          <span class="organization-name">
            {{ viewModel.organization.name }}
          </span>
          <ChevronsUpDown class="organization-switch-icon" />
        </NuxtLink>
      </div>
      <nav
        :aria-label="t('mainNavigation')"
        @click="state.sidebarOpen = false">
        <NuxtLink
          :class="{
            active: active('organizations-organizationKey-issues'),
          }"
          data-tour="all-issues"
          :to="organizationRoutes.issues()">
          <ClipboardList />
          {{ t('allIssues') }}
        </NuxtLink>
        <NuxtLink
          :class="{ active: active('organizations-organizationKey-history') }"
          :to="organizationRoutes.history()">
          <History />
          {{ t('history') }}
        </NuxtLink>
        <div
          class="nav-title"
          data-tour="spaces">
          {{ t('spaces') }}
        </div>
        <p
          v-if="viewModel.spaces.length === 0"
          class="nav-hint">
          {{ t('spaceHint') }}
        </p>
        <div
          v-for="space in viewModel.spaces"
          :key="space.key"
          class="space-group">
          <NuxtLink
            :class="{ active: spaceActive(space) }"
            :to="organizationRoutes.space(space.key)">
            <SpaceIcon :style="{ color: space.color }" />
            {{ space.name }}
          </NuxtLink>
        </div>
        <NuxtLink
          v-if="viewModel.organization.canCreateSpaces"
          exact-active-class="active"
          :to="organizationRoutes.newSpace()">
          <Plus />
          {{ t('createSpace') }}
        </NuxtLink>
        <NuxtLink
          class="sidebar-bottom"
          :class="{ active: within('organizations-organizationKey-retro') }"
          :to="organizationRoutes.retros()">
          <RetroIcon />
          {{ t('retro') }}
          <span class="muted nav-badge">{{ t('alpha') }}</span>
        </NuxtLink>
        <NuxtLink
          v-if="adminHome"
          :class="{ active: within('organizations-organizationKey-admin') }"
          data-tour="organization-settings"
          :to="adminHome">
          <Settings />
          {{ t('admin') }}
        </NuxtLink>
        <a
          :aria-label="t('documentationNewTab')"
          class="sidebar-documentation"
          href="https://laraue.com/blog/documentation/laraue-boards"
          rel="noopener noreferrer"
          target="_blank">
          <BookOpen />
          {{ t('documentation') }}
        </a>
      </nav>
      <div class="sidebar-footer">
        <NuxtLink
          class="sidebar-user"
          :class="{ active: within('organizations-organizationKey-account') }"
          :to="organizationRoutes.account()"
          @click="state.sidebarOpen = false">
          <span
            class="avatar"
            :style="{ background: viewModel.user.color }">
            {{ viewModel.user.initials }}
          </span>
          <span class="sidebar-user-info">
            <strong>{{ viewModel.user.name }}</strong>
            <small class="muted">
              {{ viewModel.user.tariffName || t('tariffUnavailable') }}
            </small>
          </span>
        </NuxtLink>
        <div class="sidebar-preferences">
          <button
            :aria-label="t('switchLanguage')"
            class="secondary sidebar-language"
            :title="t('switchLanguage')"
            type="button"
            @click="toggleLocale">
            <img
              alt=""
              class="language-flag"
              :src="locale === 'en' ? '/flags/us.svg' : '/flags/ru.svg'" />
            {{ t('languageName') }}
          </button>
          <button
            :aria-label="theme === 'dark' ? t('lightMode') : t('darkMode')"
            class="secondary sidebar-theme"
            :title="theme === 'dark' ? t('lightMode') : t('darkMode')"
            type="button"
            @click="toggleTheme">
            <Sun v-if="theme === 'dark'" />
            <Moon v-else />
          </button>
        </div>
        <button
          class="secondary danger sidebar-action"
          type="button"
          @click="props.onLogout">
          <LogOut />
          {{ t('logOut') }}
        </button>
      </div>
    </aside>
    <Transition name="fade">
      <button
        v-if="state.sidebarOpen"
        :aria-label="t('closeMenu')"
        class="scrim"
        @click="state.sidebarOpen = false" />
    </Transition>
    <main>
      <button
        v-if="!state.sidebarOpen"
        :aria-label="t('openMenu')"
        class="icon-btn mobile-menu-button"
        type="button"
        @click="state.sidebarOpen = true">
        <Menu />
      </button>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  ChevronsUpDown,
  ClipboardList,
  History,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
} from '@lucide/vue'

import type { AppPreferences } from '~/composables/useAppPreferences'
import { RetroIcon, SpaceIcon } from '~/constants/icons'
import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'

const props = defineProps<{
  onLogout: () => void
  preferences: AppPreferences
  viewModel: AppLayoutData
}>()
const route = useRoute<OrganizationRouteName>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({ sidebarOpen: false })
const locale = props.preferences.locale
const theme = props.preferences.theme
const { t } = useI18n({
  en: {
    admin: 'Admin',
    allIssues: 'All issues',
    alpha: 'alpha',
    closeMenu: 'Close menu',
    createSpace: 'Create space',
    currentOrganization: 'Current organization',
    darkMode: 'Dark',
    documentation: 'Documentation',
    documentationNewTab: 'Documentation (opens in a new tab)',
    history: 'History',
    languageName: 'English',
    lightMode: 'Light',
    logOut: 'Log out',
    mainNavigation: 'Main navigation',
    openMenu: 'Open menu',
    retro: 'Retro',
    spaceHint: 'A space groups the boards and issues of one project.',
    spaces: 'Spaces',
    switchLanguage: 'Switch language to Russian',
    switchOrganization: 'Switch organization',
    tariffUnavailable: 'Tariff unavailable',
  },
  ru: {
    admin: 'Админка',
    allIssues: 'Все задачи',
    alpha: 'альфа',
    closeMenu: 'Закрыть меню',
    createSpace: 'Создать раздел',
    currentOrganization: 'Текущая организация',
    darkMode: 'Тёмная',
    documentation: 'Документация',
    documentationNewTab: 'Документация (откроется в новой вкладке)',
    history: 'История',
    languageName: 'Русский',
    lightMode: 'Светлая',
    logOut: 'Выйти',
    mainNavigation: 'Главная навигация',
    openMenu: 'Открыть меню',
    retro: 'Ретро',
    spaceHint: 'В разделе собраны доски и задачи проекта.',
    spaces: 'Разделы',
    switchLanguage: 'Переключить язык на английский',
    switchOrganization: 'Сменить организацию',
    tariffUnavailable: 'Тариф недоступен',
  },
})
const active = (name: OrganizationRouteName) => route.name === name
const within = (name: OrganizationRouteName) =>
  typeof route.name === 'string' && route.name.startsWith(name)
const adminHome = computed(() => {
  const organization = props.viewModel.organization
  if (organization.canUpdate) {
    return organizationRoutes.admin()
  }
  if (organization.canManage) {
    return organizationRoutes.permissions()
  }
  if (organization.canManageAttributes) {
    return organizationRoutes.attributes()
  }
  if (organization.canMassMove) {
    return organizationRoutes.dataMovement()
  }
  if (organization.canViewBilling) {
    return organizationRoutes.adminTransactions()
  }
  return undefined
})
const spaceActive = (space: AppLayoutData['spaces'][number]) =>
  within('organizations-organizationKey-spaces-spaceKey') &&
  route.params.spaceKey !== undefined &&
  route.params.spaceKey === space.key
const toggleTheme = () => {
  props.preferences.setTheme(theme.value === 'dark' ? 'light' : 'dark')
}
const toggleLocale = () => {
  props.preferences.setLocale(locale.value === 'en' ? 'ru' : 'en')
}
</script>

<style scoped>
.shell {
  --layout-content-padding: var(--space-6);

  align-items: start;
  background: var(--color-workspace);
  border-inline: 1px solid var(--color-divider);
  box-shadow: var(--shadow-workspace);
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  margin-inline: auto;
  max-width: var(--workspace-max-width);
  min-height: 100dvh;
}

aside {
  background: var(--color-surface);
  border-right: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow-y: auto;
  padding: var(--space-4) var(--space-3);
  position: sticky;
  scrollbar-gutter: stable;
  top: 0;
  width: 100%;
}

aside .logo {
  padding: var(--space-1) var(--space-2) var(--space-5);
}

aside > nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

aside > nav a,
aside > nav button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: flex;
  gap: var(--space-2);
  height: var(--control-height);
  margin: 2px 0;
  padding: var(--space-2) var(--space-3);
  text-align: left;
  text-decoration: none;
  transition: var(--transition-press);
  width: 100%;
}

/* Retro is still finding its shape, so the sidebar says so out loud. */
.nav-badge {
  border: 1px solid currentcolor;
  border-radius: var(--radius-pill);
  font-size: var(--font-size-caption);
  margin-left: auto;
  padding: 0 var(--space-2);
}

aside > nav a:hover,
aside > nav button:hover {
  background: var(--color-soft);
  color: var(--color-text);
}

aside > nav a:active,
aside > nav button:active {
  translate: 0 var(--press-offset);
}

aside > nav a.active,
aside > nav button.active {
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.nav-hint {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  line-height: 1.4;
  padding: 0 var(--space-3) var(--space-2);
}

.nav-title {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  padding: var(--space-5) var(--space-3) var(--space-2);
  text-transform: uppercase;
}

main {
  display: grid;
  grid-column: 2;
  height: 100dvh;
  min-width: 0;
  overflow: auto;
  padding: var(--layout-content-padding);
  position: relative;
  width: 100%;
}

main > :deep(*) {
  min-width: 0;
}

main :deep(.page-load-state) {
  min-height: 0;
  padding: 0;
}

.mobile-menu-button {
  display: none;
}

.mobile-menu-button:hover {
  background: var(--color-hover);
}

.scrim {
  background: #10182880;
  border: 0;
  border-radius: 0;
  inset: 0;
  position: fixed;
  z-index: 29;
}

.sidebar-footer {
  border-top: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-2);
  padding-top: var(--space-3);
}

.sidebar-preferences {
  display: flex;
  gap: var(--space-2);
}

.sidebar-language {
  flex: 1;
  justify-content: flex-start;
  min-width: 0;
}

.sidebar-theme {
  flex: 0 0 auto;
}

.sidebar-user {
  align-items: center;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2);
  text-decoration: none;
  transition: var(--transition-press);
}

.sidebar-user:hover {
  background: var(--color-soft);
}

.sidebar-user:active {
  translate: 0 var(--press-offset);
}

/* Retro and the docs live together at the bottom, away from the settings block. */
.sidebar-bottom {
  margin-top: auto;
}

.sidebar-user-info {
  display: grid;
  flex: 1;
  min-width: 0;
}

.sidebar-user strong,
.sidebar-user small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-action {
  justify-content: flex-start;
  width: 100%;
}

.language-flag {
  border: 1px solid var(--color-border);
  border-radius: 2px;
  height: 16px;
  object-fit: cover;
  width: 21px;
}

.organization {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-weight: var(--font-weight-bold);
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  min-width: 0;
  position: relative;
  width: 100%;
}

.organization-select {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: inherit;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  text-decoration: none;
  transition: var(--transition-press);
  width: 100%;
}

.organization-select:hover {
  border-color: var(--color-border);
}

.organization-select:active {
  translate: 0 var(--press-offset);
}

.organization-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-switch-icon {
  color: var(--color-muted);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .shell {
    --layout-content-padding: var(--space-3);

    border-inline: 0;
    box-shadow: none;
    display: block;
    padding: 0;
  }

  :global(body:has(aside.open)) {
    overflow: hidden;
  }

  aside {
    border-radius: 0;
    height: 100dvh;
    inset: 0 auto 0 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    position: fixed;
    transform: translateX(-100%);
    transition: transform var(--duration-base) var(--ease-standard);
    width: 280px;
    z-index: 30;
  }

  aside.open {
    box-shadow: 0 0 40px #00000059;
    transform: none;
  }

  main {
    grid-column: auto;
    width: 100%;
  }

  main :deep(.page-heading) {
    padding-left: calc(var(--icon-btn-size) + var(--space-2));
  }

  .mobile-menu-button {
    display: inline-flex;
    left: var(--layout-content-padding);
    position: absolute;
    top: calc(var(--layout-content-padding) + var(--space-1));
    z-index: 28;
  }
}
</style>
