/**
 * Utility function to load a script and inject it into the DOM
 * @param url The url of the script to load
 * @param async If the script should be loaded asynchronously
 * @param type The type of the script
 */
export const loadScript = (
  url: string,
  async = 'true',
  type = 'text/javascript'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script')

    scriptElement.setAttribute('src', url)
    scriptElement.setAttribute('async', async)
    scriptElement.setAttribute('type', type)

    document.body.appendChild(scriptElement)

    scriptElement.addEventListener('load', () => {
      resolve()
    })

    scriptElement.addEventListener('error', () => {
      reject(`There was an error trying to load the script: ${url}`)
    })
  })
}
