export const COLORS = {
  amber: '#c99724',
  blue: '#4774d4',
  coral: '#df725c',
  cyan: '#3295b5',
  emerald: '#319378',
  gray: '#98a2b3',
  green: '#489c61',
  indigo: '#5d60ca',
  lime: '#79a948',
  orange: '#dc8735',
  pink: '#c65f98',
  purple: '#8a5fc1',
  red: '#d65f63',
  rose: '#cf637f',
  sky: '#438bc7',
  teal: '#338f91',
} as const

export const DEFAULT_COLOR = COLORS.blue

export const COLOR_PALETTE = [
  { key: 'gray', value: COLORS.gray },
  { key: 'amber', value: COLORS.amber },
  { key: 'orange', value: COLORS.orange },
  { key: 'coral', value: COLORS.coral },
  { key: 'red', value: COLORS.red },
  { key: 'rose', value: COLORS.rose },
  { key: 'lime', value: COLORS.lime },
  { key: 'green', value: COLORS.green },
  { key: 'emerald', value: COLORS.emerald },
  { key: 'teal', value: COLORS.teal },
  { key: 'cyan', value: COLORS.cyan },
  { key: 'sky', value: COLORS.sky },
  { key: 'blue', value: COLORS.blue },
  { key: 'indigo', value: COLORS.indigo },
  { key: 'purple', value: COLORS.purple },
  { key: 'pink', value: COLORS.pink },
] as const
