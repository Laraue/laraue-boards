import type { SignUpOrigin } from '#layers/core/app/signUpOrigin/signUpOrigin'

/**
 * The sign-up origin (BRD-295) as the Google and Mini App sign-in requests take it; empty when there is none, so the
 * request carries no such fields.
 */
export const webSignUpFields = (origin: null | SignUpOrigin) => ({
  signUpLandingUrl: origin?.landingUrl,
  signUpReferrer: origin?.referrer ?? undefined,
})

/** The same for the Telegram login widget request, whose own fields are snake_case. */
export const widgetSignUpFields = (origin: null | SignUpOrigin) => ({
  sign_up_landing_url: origin?.landingUrl,
  sign_up_referrer: origin?.referrer ?? undefined,
})
