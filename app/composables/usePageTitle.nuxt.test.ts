import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, test } from 'vitest'
import { defineComponent, h, ref } from 'vue'

const Titled = defineComponent({
  props: { title: { required: true, type: String } },
  setup: (props) => {
    usePageTitle(() => props.title)
    return () => h('p', props.title)
  },
})

test('brings the page title back once a dialog with its own title closes', async () => {
  const dialogOpen = ref(true)
  const Page = defineComponent({
    setup: () => {
      const current = useCurrentPageTitle()
      return () =>
        h('div', [
          h('output', current.value),
          h(Titled, { title: 'Board' }),
          dialogOpen.value ? h(Titled, { title: 'DEF-1' }) : null,
        ])
    },
  })

  const wrapper = await mountSuspended(Page)
  await nextTick()
  expect(wrapper.find('output').text()).toBe('DEF-1')

  dialogOpen.value = false
  await nextTick()
  expect(wrapper.find('output').text()).toBe('Board')

  wrapper.unmount()
})
