/** Whether the organization's sidebar is open on a phone: the layout shows it, a page's
 * PageHeader opens it from its menu button. */
export const useSidebarOpen = () => useState('sidebar-open', () => false)
