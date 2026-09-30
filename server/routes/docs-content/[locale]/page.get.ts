// One docs page: `/docs-content/en/page?path=concepts/issues` (an empty path is the home page).
export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  const { path = '' } = getQuery(event)
  const segments = String(path).split('/').filter(Boolean)
  if (
    (locale !== 'en' && locale !== 'ru') ||
    segments.some((segment) => !/^[a-z0-9-]+$/.test(segment))
  ) {
    throw createError({ statusCode: 404 })
  }

  const page = (await useDocsCatalog()).page(locale, segments)
  if (!page) {
    throw createError({ statusCode: 404 })
  }

  return page
})
