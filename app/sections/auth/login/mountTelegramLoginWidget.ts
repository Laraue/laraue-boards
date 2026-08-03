export const mountTelegramLoginWidget = ({
  botName,
  callbackName,
  container,
}: {
  botName: string
  callbackName: string
  container: HTMLElement
}): void => {
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', botName)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-onauth', `${callbackName}(user)`)
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-radius', '10')
  script.setAttribute('data-userpic', 'true')
  container.appendChild(script)
}
