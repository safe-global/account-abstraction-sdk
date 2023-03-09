/**
 * @jest-environment jsdom
 */

import * as utils from './utils'

describe('utils', () => {
  describe('loadScript', () => {
    it('should add a script tag to the DOM', async () => {
      utils.loadScript('https://example.com')
      const element = document.querySelector('script[src="https://example.com"]')
      expect(element?.getAttribute('src')).toBe('https://example.com')
      expect(element?.getAttribute('type')).toBe('text/javascript')
    })
  })
})
