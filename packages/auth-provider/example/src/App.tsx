import { useEffect, useState } from 'react'
import { SafeEventEmitterProvider } from '@web3auth/base'
import { Box, Divider, Grid, TextField, Typography } from '@mui/material'
import { EthHashInfo } from '@safe-global/safe-react-components'
import { SafeAuth, SafeAuthProviderType, SafeAuthSignInData } from '../../src/index'

import AppBar from './AppBar'

function App() {
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<SafeAuthSignInData | null>(
    null
  )
  const [safeAuth, setSafeAuth] = useState<SafeAuth>()
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null)

  useEffect(() => {
    setSafeAuth(
      new SafeAuth(SafeAuthProviderType.Web3Auth, {
        chainId: '0x5',
        txServiceUrl: 'https://safe-transaction-goerli.safe.global',
        authProviderConfig: {
          rpcTarget: `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
          web3AuthClientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '',
          web3AuthNetwork: 'testnet',
          theme: 'dark'
        }
      })
    )
  }, [])

  const login = async () => {
    if (!safeAuth) return

    const response = await safeAuth.signIn()
    console.log('response', response)
    setSafeAuthSignInResponse(response)
    setProvider(safeAuth.getProvider())
  }

  const logout = async () => {
    if (!safeAuth) return

    await safeAuth.signOut()

    setProvider(null)
    setSafeAuthSignInResponse(null)
    setError('')
    setInfo('')
  }

  return (
    <>
      <AppBar onLogin={login} onLogout={logout} isLoggedIn={!!provider} />
      <Grid container>
        <Grid item md={3} p={4}>
          {safeAuthSignInResponse?.eoa && (
            <EthHashInfo
              address={safeAuthSignInResponse.eoa}
              showCopyButton
              showPrefix
              prefix={safeAuthSignInResponse?.chainId === '1' ? 'eth' : 'gor'}
            />
          )}
        </Grid>
        <Grid item md={9} p={4}>
          {provider && (
            <>
              {safeAuthSignInResponse?.safes?.length ? (
                <>
                  <Typography variant="h3" color="secondary" fontWeight={700}>
                    Available Safes
                  </Typography>
                  {safeAuthSignInResponse?.safes?.map((safe, index) => (
                    <Box sx={{ my: 3 }} key={index}>
                      <EthHashInfo address={safe} showCopyButton />
                    </Box>
                  ))}
                </>
              ) : (
                <Typography variant="h4" color="secondary" sx={{ my: 3 }}>
                  You don't have any Safe available
                </Typography>
              )}
              <Divider sx={{ my: 4 }} />
              {info && (
                <TextField sx={{ mt: 4, width: '100%' }} multiline maxRows={20} value={info} />
              )}

              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 4, width: '100%' }}>
                  {error}
                </Typography>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default App
