export const loadScript = (
  url: string,
  async = 'true',
  type = 'text/javascript'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let scriptElement = document.createElement('script')

    scriptElement.setAttribute('src', url)
    scriptElement.setAttribute('type', type)
    scriptElement.setAttribute('async', async)

    document.body.appendChild(scriptElement)

    scriptElement.addEventListener('load', () => {
      resolve()
    })

    scriptElement.addEventListener('error', () => {
      reject()
    })
  })
}
