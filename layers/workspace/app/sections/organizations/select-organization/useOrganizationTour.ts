import type { Ref } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import type { TourStateDeps, TourStep } from '#layers/workspace/app/shared/composables/useTour'
import { useTour } from '#layers/workspace/app/shared/composables/useTour'

import type { OrganizationPickerItem } from './OrganizationPickerPage.deps'

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
      personalTitle: 'Ваша личная организация',
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
