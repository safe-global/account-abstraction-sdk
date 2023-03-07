import { useEffect, useState } from 'react'
import { SafeEventEmitterProvider, WALLET_ADAPTERS } from '@web3auth/base'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { EthHashInfo } from '@safe-global/safe-react-components'
import { SafeAuthKit, SafeAuthProviderType, SafeAuthSignInData } from '../../src/index'

import AppBar from './AppBar'

function App() {
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<SafeAuthSignInData | null>(
    null
  )
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit>()
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null)

  useEffect(() => {
    ;(async () => {
      setSafeAuth(
        await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
          chainId: '0x5',
          txServiceUrl: 'https://safe-transaction-goerli.safe.global', // Optional. Only if want to retrieve related safes
          authProviderConfig: {
            rpcTarget: `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
            clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '',
            network: 'testnet',
            theme: 'dark',
            modalConfig: {
              [WALLET_ADAPTERS.TORUS_EVM]: {
                label: 'metamask',
                showOnModal: false
              },
              [WALLET_ADAPTERS.METAMASK]: {
                label: 'metamask',
                showOnDesktop: true,
                showOnMobile: false
              }
            }
          }
        })
      )
    })()
  }, [])

  const login = async () => {
    if (!safeAuth) return

    const response = await safeAuth.signIn()
    console.log('SIGN IN RESPONSE: ', response)

    setSafeAuthSignInResponse(response)
    setProvider(safeAuth.getProvider() as SafeEventEmitterProvider)
  }

  const logout = async () => {
    if (!safeAuth) return

    await safeAuth.signOut()

    setProvider(null)
    setSafeAuthSignInResponse(null)
  }

  return (
    <>
      <AppBar onLogin={login} onLogout={logout} isLoggedIn={!!provider} />
      {safeAuthSignInResponse?.eoa && (
        <Grid container>
          <Grid item md={4} p={4}>
            <Typography variant="h3" color="secondary" fontWeight={700}>
              Owner account
            </Typography>
            <Divider sx={{ my: 3 }} />
            <EthHashInfo
              address={safeAuthSignInResponse.eoa}
              showCopyButton
              showPrefix
              prefix={getPrefix(safeAuthSignInResponse.chainId)}
            />
          </Grid>
          <Grid item md={8} p={4}>
            <>
              <Typography variant="h3" color="secondary" fontWeight={700}>
                Available Safes
              </Typography>
              <Divider sx={{ my: 3 }} />
              {safeAuthSignInResponse?.safes?.length ? (
                safeAuthSignInResponse?.safes?.map((safe, index) => (
                  <Box sx={{ my: 3 }} key={index}>
                    <EthHashInfo address={safe} showCopyButton shortAddress={false} />
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="secondary" fontWeight={700}>
                  No Available Safes
                </Typography>
              )}
            </>
          </Grid>
        </Grid>
      )}
    </>
  )
}

const getPrefix = (chainId: string) => {
  switch (chainId) {
    case '0x1':
      return 'eth'
    case '0x5':
      return 'gor'
    case '0x100':
      return 'gno'
    case '0x137':
      return 'matic'
    default:
      return 'eth'
  }
}

export default App
