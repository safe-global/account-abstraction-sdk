import { useEffect, useState } from 'react'
import { isAddress } from '@ethersproject/address'
import { SafePayments } from '../../../src/index'
import { Grid, TextField, Button } from '@mui/material'

import AppBar from './AppBar'

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [onRampClient, setOnRampClient] = useState<any>(null)
  const [onRampSession, setOnRampSession] = useState<any>(null)

  const handleCreateSession = async () => {
    if (!isAddress(walletAddress)) return

    const session = await onRampClient.createSession(walletAddress)

    setOnRampSession(session)
  }

  useEffect(() => {
    if (!onRampSession) return

    onRampSession.mount('#stripe-root')

    const handler = (event: any) => {
      console.log('event', event)
    }

    onRampSession.addEventListener('*', handler)

    return () => {
      onRampSession.removeEventListener(handler)
    }
  }, [onRampSession])

  useEffect(() => {
    ;(async () => {
      const onRampClient = await SafePayments.initialize({
        stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        safePaymentsBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL,
        mountElementSelector: '#stripe-root'
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
            id="outlined-basic"
            label="Outlined"
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
