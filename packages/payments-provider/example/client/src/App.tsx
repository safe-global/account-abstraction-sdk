import { useEffect, useState } from 'react'
import { isAddress } from '@ethersproject/address'
import { SafePayments } from '../../../src'
import { Grid, TextField, Button } from '@mui/material'

import AppBar from './AppBar'
import { SafePaymentsProviderType } from '../../../src/types'

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [onRampClient, setOnRampClient] = useState<SafePayments>()

  const handleCreateSession = async () => {
    if (!isAddress(walletAddress)) return

    await onRampClient?.open({ walletAddress, element: '#stripe-root' })
  }

  useEffect(() => {
    ;(async () => {
      const onRampClient = await SafePayments.initialize(SafePaymentsProviderType.Stripe, {
        paymentsProviderConfig: {
          stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
          safePaymentsBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL
        }
      })

      setOnRampClient(onRampClient)
    })()
  }, [])

  return (
    <>
      <AppBar />
      <Grid container p={2}>
        <Grid item sm={12} md={4}>
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
        <Grid item sm={12} md={8}>
          <div id="stripe-root"></div>
        </Grid>
      </Grid>
    </>
  )
}

export default App
