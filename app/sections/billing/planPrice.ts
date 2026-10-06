import type { BillingPlanViewModel } from './BillingPage.deps'

// "500₽ (~$5)": the price a customer is charged, and the approximate amount in the reference
// currency when it is known.
export const formatPlanPrice = (plan: BillingPlanViewModel): string =>
  plan.referencePrice ? `${plan.formattedPrice} (~${plan.referencePrice})` : plan.formattedPrice
