import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export const sidebarOpenKey: InjectionKey<Ref<boolean>> = Symbol('workspace-sidebar')
export const useSidebarOpen = () => inject(sidebarOpenKey, undefined)
