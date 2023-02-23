# Safe Auth Kit

This library provides a way to authenticate users using mails, social accounts or traditional web3 wallets (Metamask ...). When using web2 methods as your social account, a derived ethereum address will be generated.

# Quickstart

### Prerequisites

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)
- For using Web3Auth as the authentication provider, you need to have a [Web3Auth account](https://web3auth.io) so sign up if you don't have one already.

### Install dependencies

If you are using Web3Auth as the authentication provider, you need to install the peerDependencies `@web3auth/base`, `@web3auth/modal` and `@web3auth/openlogin-adapter` packages.

```bash
npm install @safe-global/safe-auth-kit @web3auth/base @web3auth/modal @web3auth/openlogin-adapter
yarn add @safe-global/safe-auth-kit @web3auth/base @web3auth/modal @web3auth/openlogin-adapter
```

### How to use

Create an instance of the [SafeAuthKit](https://github.com/safe-global/account-abstraction-sdk/blob/b8aab58cce5e985e29cfb03924c8b973f2ee8a37/packages/auth-kit/src/SafeAuthKit.ts) class providing the `SafeAuthProviderType` and `SafeAuthConfig` as parameters.

Currently we only support the `Web3Auth` provider type but we plan to add more providers in the future.

```typescript
const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
  chainId: '0x5',
  authProviderConfig: {
    rpc: <Your rpc url>, // Add your RPC e.g. https://mainnet.infura.io/v3/<your project id>
    clientId: <Your client id>, // Add your client id. Get it from the Web3Auth dashboard
    network: 'testnet' | 'mainnet' | 'cyan', // The network to use for the Web3Auth modal
    theme: 'light' | 'dark' // The theme to use for the Web3Auth modal
  }
})
```

The `authProviderConfig` object is the specific configuration object for the Web3Auth modal:

- `rpc`: The rpc url to connect to the ethereum network
- `clientId`: The client id of your Web3Auth account. You need to create an application in your [Web3Auth account](https://dashboard.web3auth.io) to get this value
- `network`: The network name to use for the Web3Auth modal (mainnet | testnet | cyan)
- `theme`: The theme to use for the Web3Auth modal (dark | light)

Once the instance is created, you can call the `signIn()` method to start the authentication process showing the web3Auth modal.
While you sign in with the same mail or social account, the same ethereum address will be returned.

```typescript
// The signIn method will return the user's ethereum address
// The await will last until the user is authenticated so while the UI modal is showed
await safeAuthKit.signIn()
```

The `signOut` method will remove the current session.

```typescript
await safeAuthKit.signOut()
```

You can get the ethereum provider instance by calling the `getProvider` method.

```typescript
safeAuthKit.getProvider()
```

We expose two events in order to know when the user is authenticated or when the session is removed.

```typescript
safeAuthKit.subscribe(SafeAuthEvents.SIGN_IN, () => {
  console.log('User is authenticated')
})

safeAuthKit.subscribe(SafeAuthEvents.SIGN_OUT, () => {
  console.log('User is not authenticated')
})
```

It's also possible to get the associated Safe addresses to a external owned account adding the transaction service url to the config. This could be useful depending on your workflow.

```typescript
const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
  ...
  txServiceUrl: 'https://safe-transaction-goerli.safe.global' // Add the corresponding transaction service url depending on the network
  authProviderConfig: { ... }
})
```

When `txServiceUrl` is provided, the list of associated Safe addresses will be returned as part of the `signIn()` method response.
