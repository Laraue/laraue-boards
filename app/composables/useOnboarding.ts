export type OnboardingTask = 'board' | 'invite' | 'issue' | 'move'

const TASKS_KEY = 'onboarding:tasks:v1'
const DISMISSED_KEY = 'onboarding:checklist:v1'

type DoneTasks = Record<string, OnboardingTask[]>

const done = ref<DoneTasks>({})
const dismissed = ref(false)

const read = (): DoneTasks => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(TASKS_KEY) ?? '{}')
    return raw && typeof raw === 'object' ? (raw as DoneTasks) : {}
  } catch {
    return {}
  }
}

/**
 * Tasks the layout cannot see in its own data — creating an issue, sharing the
 * invitation link — report themselves here from wherever they actually happen.
 */
export const completeOnboardingTask = (organizationKey: string, task: OnboardingTask): void => {
  const tasks = read()
  const organizationTasks = tasks[organizationKey] ?? []
  if (organizationTasks.includes(task)) {
    return
  }

  const next = { ...tasks, [organizationKey]: [...organizationTasks, task] }
  localStorage.setItem(TASKS_KEY, JSON.stringify(next))
  done.value = next
}

export const useOnboardingTasks = (organizationKey: () => string) => {
  onMounted(() => {
    done.value = read()
    dismissed.value = localStorage.getItem(DISMISSED_KEY) === 'dismissed'
  })

  return {
    completed: computed(() => done.value[organizationKey()] ?? []),
    dismiss: () => {
      localStorage.setItem(DISMISSED_KEY, 'dismissed')
      dismissed.value = true
    },
    dismissed: readonly(dismissed),
  }
}
