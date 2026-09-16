import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { OrganizationPickerItem } from './OrganizationPickerPage.types'

export const useOrganizationTour = (
  organizations: Readonly<Ref<OrganizationPickerItem[] | undefined>>,
  deps: TourStateDeps,
): void => {
  const { t } = useI18n({
    en: {
      personalDescription: 'Use your personal organization for your own projects and tasks.',
      personalTitle: 'Your personal workspace',
      teamDescription: 'Create another organization when you want to work together with a team.',
      teamTitle: 'Bring your team together',
    },
    ru: {
      personalDescription: 'Используйте личную организацию для своих проектов и задач.',
      personalTitle: 'Ваше личное рабочее пространство',
      teamDescription: 'Создайте организацию, чтобы работать вместе с командой.',
      teamTitle: 'Объедините команду',
    },
  })
  const steps: TourStep[] = [
    {
      description: t('personalDescription'),
      placement: 'right',
      target: '[data-tour="personal-organization"]',
      title: t('personalTitle'),
    },
    {
      description: t('teamDescription'),
      placement: 'top',
      target: '[data-tour="create-organization"]',
      title: t('teamTitle'),
    },
  ]

  useTour({
    ready: () => organizations.value !== undefined,
    state: deps,
    steps: () => steps,
  })
}
