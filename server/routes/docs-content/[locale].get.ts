// The docs' tree of a language (titles and order, no texts), for the menu.
export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  if (locale !== 'en' && locale !== 'ru') {
    throw createError({ statusCode: 404 })
  }

  return (await useDocsCatalog()).tree(locale)
})
