// Fades `.reveal` elements in as they scroll into view. Without JS (or with reduced motion) they
// are simply visible - see the landing layout for the CSS side.
export const useScrollReveal = (root: Readonly<Ref<HTMLElement | null>>): void => {
  onMounted(() => {
    if (!root.value || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.15 },
    )

    for (const element of root.value.querySelectorAll('.reveal')) {
      observer.observe(element)
    }

    onBeforeUnmount(() => observer.disconnect())
  })
}
