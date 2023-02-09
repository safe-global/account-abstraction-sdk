# How to use

Create an instance of the SafeAuth class and pass the `SafeAuthProviderType` and the `SafeAuthConfig` object as parameters.

```typescript
const safeAuth = new SafeAuth(SafeAuthProviderType.Web3Auth, {
  chainId: '0x5',
  txServiceUrl: 'https://safe-transaction-goerli.safe.global',
  authProviderConfig: {
    rpcTarget: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    web3AuthClientId: process.env.REACT_APP_WEB3AUTH_CLIENT_ID || '',
    web3AuthNetwork: 'testnet',
    theme: 'dark'
  }
})
```

Once the instance is created, you can call the `signIn` method to start the authentication process showing the web3Auth modal.

```typescript
web3Auth.signIn()
```

The `signOut` method will remove the current session.

```typescript
web3Auth.signOut()
```

You can get the provider instance by calling the `getProvider` method.

```typescript
web3Auth.getProvider()
```

We expose to events to know when the user is authenticated or when the session is removed.

```typescript
web3Auth.subscribe(SafeAuthEvents.SIGN_IN, () => {
  console.log('User is authenticated')
})

web3Auth.subscribe(SafeAuthEvents.SIGN_OUT, () => {
  console.log('User is not authenticated')
})
```
