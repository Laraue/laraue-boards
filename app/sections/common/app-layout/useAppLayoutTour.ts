import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { AppLayoutData } from './AppLayout.types'

export const useAppLayoutTour = (
  data: Readonly<Ref<AppLayoutData | undefined>>,
  deps: TourStateDeps,
): void => {
  const { t } = useI18n({
    en: {
      eachOrganization: 'each organization',
      issuesDescription:
        'An issue is a task or request. All issues shows them across every space, so nothing gets lost between projects.',
      issuesTitle: 'Issues are your tasks',
      organizationDescription:
        'Switch between organizations here — {organization} has its own spaces and issues.',
      organizationTitle: 'Your organization',
      settingsDescription:
        'Members, attributes, and the rest of the organization settings live here.',
      settingsTitle: 'Workspace settings',
      spacesDescription:
        'A space is a project or a large area of work — similar to an epic. Inside it, the backlog holds unscheduled issues and boards show their workflow.',
      spacesTitle: 'Spaces, backlog, and boards',
    },
    ru: {
      eachOrganization: 'каждой организации',
      issuesDescription:
        'Задача — это поручение или запрос. На странице «Все задачи» они собраны из всех разделов, чтобы ничего не потерялось между проектами.',
      issuesTitle: 'Задачи — это ваша работа',
      organizationDescription:
        'Здесь можно переключаться между организациями. У {organization} свои разделы и задачи.',
      organizationTitle: 'Ваша организация',
      settingsDescription: 'Здесь находятся участники, атрибуты и остальные настройки организации.',
      settingsTitle: 'Настройки рабочего пространства',
      spacesDescription:
        'Раздел — это проект или большая область работы, похожая на эпик. В бэклоге хранятся незапланированные задачи, а на досках показан ход работы.',
      spacesTitle: 'Разделы, бэклог и доски',
    },
  })
  const buildSteps = (current: AppLayoutData | undefined): TourStep[] => {
    const organization = current?.organization.name ?? t('eachOrganization')
    const steps: TourStep[] = [
      {
        description: t('organizationDescription', { organization }),
        placement: 'right',
        target: '[data-tour="organization-switcher"]',
        title: t('organizationTitle'),
      },
      {
        description: t('issuesDescription'),
        placement: 'right',
        target: '[data-tour="all-issues"]',
        title: t('issuesTitle'),
      },
      {
        description: t('spacesDescription'),
        placement: 'right',
        target: '[data-tour="spaces"]',
        title: t('spacesTitle'),
      },
    ]

    if (
      current?.organization.canUpdate ||
      current?.organization.canManage ||
      current?.organization.canManageAttributes ||
      current?.organization.canMassMove
    ) {
      steps.push({
        description: t('settingsDescription'),
        placement: 'right',
        target: '[data-tour="organization-settings"]',
        title: t('settingsTitle'),
      })
    }

    return steps
  }

  useTour({
    ready: () => import.meta.client && data.value !== undefined && innerWidth > 760,
    state: deps,
    steps: () => buildSteps(data.value),
  })
}
