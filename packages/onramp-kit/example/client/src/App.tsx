import { useEffect, useState, useRef } from 'react'
import { isAddress } from '@ethersproject/address'
import { SafeOnRampKit, SafeOnRampEvent, SafeOnRampProviderType } from '../../../src'
import { Grid, TextField, Button } from '@mui/material'

import AppBar from './AppBar'

const isSessionValid = (sessionId: string) => sessionId.length === 28

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [onRampClient, setOnRampClient] = useState<SafeOnRampKit>()
  const stripeRootRef = useRef<HTMLDivElement>(null)

  const handleCreateSession = async () => {
    if (!isSessionValid(sessionId) && !isAddress(walletAddress)) return

    if (stripeRootRef.current) {
      stripeRootRef.current.innerHTML = ''
    }

    const sessionData = (await onRampClient?.open({
      sessionId: sessionId,
      walletAddress,
      networks: ['ethereum', 'polygon'],
      element: '#stripe-root',
      events: {
        onLoaded: () => console.log('onLoaded()'),
        onPaymentSuccessful: (eventData: SafeOnRampEvent) =>
          console.log('onPaymentSuccessful(): ', eventData),
        onPaymentProcessing: (eventData: SafeOnRampEvent) =>
          console.log('onPaymentProcessing(): ', eventData),
        onPaymentError: (eventData: SafeOnRampEvent) => console.log('onPaymentError(): ', eventData)
      }
    })) as any

    setWalletAddress(sessionData.transaction_details.wallet_address)
  }

  useEffect(() => {
    ;(async () => {
      const onRampClient = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
        onRampProviderConfig: {
          stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
          onRampBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL
        }
      })

      setOnRampClient(onRampClient)
    })()
  }, [])

  return (
    <>
      <AppBar />
      <Grid container p={2} height="90vh">
        <Grid item sm={12} md={4} p={2} sx={{ borderRight: `1px solid #303030` }}>
          <TextField
            id="wallet-address"
            label="Wallet address"
            placeholder="Enter the address you want to initialize the session with"
            variant="outlined"
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            sx={{ width: '100%' }}
          />
          <TextField
            id="session-id"
            label="Session id"
            placeholder="Enter the session id if you have one"
            variant="outlined"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            sx={{ width: '100%', mt: 2 }}
          />
          <br />
          <Button variant="contained" onClick={handleCreateSession} sx={{ mt: 3 }}>
            Create session
          </Button>
        </Grid>
        <Grid item sm={12} md={8} p={2}>
          <div id="stripe-root" ref={stripeRootRef}></div>
        </Grid>
      </Grid>
    </>
  )
}

export default App
