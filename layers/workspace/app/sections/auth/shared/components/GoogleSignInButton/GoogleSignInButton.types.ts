/**
 * Google's OAuth popup, ready to open. Browsers allow a popup only from a click handler, so `open`
 * must be called synchronously from one. It resolves with an authorization code for the backend to
 * exchange, or undefined if the user closes the popup.
 */
export type GoogleSignInPopup = {
  open: () => Promise<string | undefined>
}
