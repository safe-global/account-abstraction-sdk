# ⚠️ Warning ⚠️

This package is provided for testing purposes only. It's not ready for production use. We are working with Stripe and participating in the pilot testing for their new [on ramp solution](https://stripe.com/es/blog/crypto-onramp). Given this we are offering our public key and a deployed server for testing purposes.

Once the Stripe pilot end the server will be removed and you should use your own keys and server in case you opt-in for the `StripeAdapter`.

````typescript

# Safe OnRamp Kit

This library provides a way for buy cryptoassets using a credit card or other payment methods.

# Quickstart

### Prerequisites

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)

### Install dependencies

```bash
npm install @safe-global/safe-onramp-kit
yarn add @safe-global/safe-onramp-kit
````

### How to use

Create an instance of the SafeOnRampKit class and pass the `SafeSafeOnRampProviderType` and the `SafeOnRampConfig` object as parameters.

```typescript
const safeOnRamp = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
  onRampProviderConfig: {
    stripePublicKey: <You public key>,
    onRampBackendUrl: <Your backend url>
  }
})
```

Currently we are providing both the public key and the server for testing purposes. In the future you will use your own public key and server based on the final documentation Stripe will provide once their on ramps solution is ready for production. See the [considerations and limitations](#considerations-and-limitations) section for more details.

Once the instance is created, you can call the `open` method to start the session with the provider and open the widget.

You should pass an object with the `SafeOnRampOpenOptions`

```typescript
await safeOnRamp.open({
  walletAddress,
  networks: ['polygon']
  element: '#stripe-root',
  events: {
    onLoaded: () => console.log('Loaded'),
    onPaymentSuccessful: () => console.log('Payment successful')
    onPaymentError: () => console.log('Payment failed')
    onPaymentProcessing: () => console.log('Payment processing')
  }
})
```

### Considerations and limitations

1. The library is in development and it's not ready for production use. We are working with Stripe and participating in the pilot testing for their new [on ramp solution](https://stripe.com/es/blog/crypto-onramp)

Given this we are offering out public key and a deployed server for testing purposes so use it like this:

```typescript
const safeOnRamp = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
  onRampProviderConfig: {
    stripePublicKey:
      'pk_test_51MZbmZKSn9ArdBimSyl5i8DqfcnlhyhJHD8bF2wKrGkpvNWyPvBAYtE211oHda0X3Ea1n4e9J9nh2JkpC7Sxm5a200Ug9ijfoO',
    onRampBackendUrl: 'https://safe-onramp-backend.5afe.dev'
  }
})
```

2. As we are working on stripe `testmode`, the purchases are being simulated. You can use the [following test data](https://stripe.com/docs/testing) and cards to enter the information in the embedded widget:

3. When testing with `testnet` as Mumbai in Polygon, the crypto assets will be transferred so please do try to use lower amounts to preserve `testnet` liquidity, but especially with USDC on Polygon.

4. If you want to deploy a POC with your solution bear in mind that our integration with stripe has whitelisted the following domains:

- localhost: For local development
- netlify.app
- vercel.app

So you can deploy your solution in one of these providers. With another domain the widget will show an error.

5. Currently the stripe widget can only be opened inside United States. If you want to test it from another country you can use a VPN. We can recommend for example [Proton VPN](https://protonvpn.com) as it have a free tier that should be enough for testing purposes. You need to connect to the United States server.
