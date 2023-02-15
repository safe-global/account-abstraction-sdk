import { useEffect } from 'react'
import { SafePayments } from '../../src/index'

import AppBar from './AppBar'

function App() {
  useEffect(() => {
    ;(async () => {
      const safePayments = await SafePayments.initialize({
        stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        safePaymentsBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL,
        mountElementSelector: '#stripe-root'
      })

      safePayments.createSession(import.meta.env.VITE_SESSION_ADDRESS)
    })()
  }, [])

  return (
    <>
      <AppBar />
      <div id="stripe-root"></div>
    </>
  )
}

export default App
