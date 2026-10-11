import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type NavTab = {
  active?: boolean
  exact?: boolean
  icon?: Component
  label: string
  to: RouteLocationRaw
}
