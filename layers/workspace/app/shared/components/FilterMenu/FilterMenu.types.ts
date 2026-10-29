import type { Component } from 'vue'

export type FilterMenuItem = {
  color?: string
  // How many values of this filter are set; shown next to its name.
  count: number
  icon: Component
  id: string
  label: string
}
