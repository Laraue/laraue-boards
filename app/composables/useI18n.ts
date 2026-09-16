type NoInfer<T> = [T][T extends unknown ? 0 : never]

type TranslationSchema = Readonly<Record<string, string>>

type TranslationMessages<Schema extends TranslationSchema> = Record<'en', Schema> & {
  ru: { [Key in keyof NoInfer<Schema>]: string }
}

export const locales = ['en', 'ru'] as const
export type Locale = (typeof locales)[number]

const pluralRules: Record<Locale, Intl.PluralRules> = {
  en: new Intl.PluralRules('en'),
  ru: new Intl.PluralRules('ru'),
}

const PLURAL_INDEX = {
  en: { few: 1, many: 1, one: 0, other: 1, two: 1, zero: 1 },
  ru: { few: 1, many: 2, one: 0, other: 2, two: 2, zero: 2 },
} as const satisfies Record<Locale, Record<Intl.LDMLPluralRule, number>>

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && locales.includes(value as Locale)

export const useLocale = () => {
  const cookie = useCookie<string>('locale')

  return useState<Locale>('app-locale', () => (isLocale(cookie.value) ? cookie.value : 'en'))
}

export const useI18n = <const Schema extends TranslationSchema>(
  messages: TranslationMessages<Schema>,
) => {
  const locale = useLocale()
  type Key = Extract<keyof Schema, string>

  const t = (key: Key, params?: Readonly<Record<string, number | string>>): string => {
    const message = messages[locale.value][key] as string

    return params
      ? message.replaceAll(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
      : message
  }

  const tc = (key: Key, count: number): string => {
    const forms = t(key)
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean)

    if (forms.length === 0) {
      return ''
    }

    if (forms.length === 1) {
      return forms[0] as string
    }

    const category = pluralRules[locale.value].select(count)
    const index = choosePluralIndex(locale.value, category, forms.length)

    return forms[index] as string
  }

  const tp = (key: Key, count: number): string => {
    const form = tc(key, count)

    return form === '' ? '' : `${count} ${form}`
  }

  return { locale, t, tp }
}

function choosePluralIndex(
  locale: Locale,
  category: Intl.LDMLPluralRule,
  formsCount: number,
): number {
  const index = PLURAL_INDEX[locale][category]

  return Math.min(index, formsCount - 1)
}
