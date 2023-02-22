# How to use

Create an instance of the SafeAuthKit class and pass the `SafeAuthProviderType` and the `SafeAuthConfig` object as parameters.

```typescript
const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
  chainId: '0x5',
  authProviderConfig: {
    rpcTarget: `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
    web3AuthClientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '',
    web3AuthNetwork: 'testnet',
    theme: 'dark'
  }
})
```

Once the instance is created, you can call the `signIn` method to start the authentication process showing the web3Auth modal.

```typescript
await safeAuthKit.signIn()
```

The `signOut` method will remove the current session.

```typescript
await safeAuthKit.signOut()
```

You can get the provider instance by calling the `getProvider` method.

```typescript
safeAuthKit.getProvider()
```

We expose to events to know when the user is authenticated or when the session is removed.

```typescript
safeAuthKit.subscribe(SafeAuthEvents.SIGN_IN, () => {
  console.log('User is authenticated')
})

safeAuthKit.subscribe(SafeAuthEvents.SIGN_OUT, () => {
  console.log('User is not authenticated')
})
```

It's also possible to get the associated safes to a external owned account adding the transaction service url to the config.

```typescript
const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
  ...
  txServiceUrl: 'https://safe-transaction-goerli.safe.global'
  authProviderConfig: { ... }
})
```

When provided, the list of associated safes will be provided as part of the `signIn` method response.
