import { useEffect, useState } from 'react'
import { isAddress } from '@ethersproject/address'
import { SafeOnRampKit } from '../../../src'
import { Grid, TextField, Button } from '@mui/material'

import AppBar from './AppBar'
import { SafeOnRampProviderType } from '../../../src/types'

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [onRampClient, setOnRampClient] = useState<SafeOnRampKit>()

  const handleCreateSession = async () => {
    if (!isAddress(walletAddress)) return

    await onRampClient?.open({
      walletAddress,
      networks: ['polygon'],
      element: '#stripe-root',
      events: {
        onLoaded: () => console.log('Loaded'),
        onPaymentSuccessful: () => console.log('Payment successful'),
        onPaymentProcessing: () => console.log('Payment processing'),
        onPaymentError: () => console.log('Payment failed')
      }
    })
  }

  useEffect(() => {
    ;(async () => {
      const onRampClient = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
        paymentsProviderConfig: {
          stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
          safeOnRampBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL
        }
      })

      setOnRampClient(onRampClient)
    })()
  }, [])

  return (
    <>
      <AppBar />
      <Grid container p={2}>
        <Grid item sm={12} md={4} p={2}>
          <TextField
            id="wallet-address"
            label="Wallet address"
            placeholder="Enter the address you want to initialize the session with"
            variant="outlined"
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            sx={{ width: '100%' }}
          />
          <br />
          <Button variant="contained" onClick={handleCreateSession} sx={{ mt: 2 }}>
            Create session
          </Button>
        </Grid>
        <Grid item sm={12} md={8} p={2}>
          <div id="stripe-root"></div>
        </Grid>
      </Grid>
    </>
  )
}

export default App
