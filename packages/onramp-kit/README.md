# ⚠️ Warning ⚠️

This package is provided for testing purposes only. It's not ready for production use. We are working with Stripe and participating in the pilot testing for their new [on ramp solution](https://stripe.com/es/blog/crypto-onramp). Given this, we are offering our public key and a deployed server with our private one during the [Safe Account Abstraction hackaton](https://www.notion.so/Safe-Hackathon-Success-Guide-26ccbd7263ab44808d8f00106f35c2d7)

Once the hackaton and Stripe pilot ends the server will be removed and you should use your own keys and server in case you opt-in for the [StripeAdapter](https://github.com/safe-global/account-abstraction-sdk/blob/d56b46e44ea50221e0c63e2e96a62485ef72d903/packages/onramp-kit/src/adapters/StripeAdapter.ts).

Currently this package is only prepared to work with Stripe. See [considerations and limitations](#considerations-and-limitations) for more details.

# Safe OnRamp Kit

This kit provides a way for buy cryptoassets using a credit card or other payment methods. The library give access to several on ramp providers through several adapters.

# Quickstart

### Prerequisites

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)

### Install dependencies

```bash
npm install @safe-global/safe-onramp-kit
yarn add @safe-global/safe-onramp-kit
```

### How to use

Create an instance of the [SafeOnRampKit](https://github.com/safe-global/account-abstraction-sdk/blob/d56b46e44ea50221e0c63e2e96a62485ef72d903/packages/onramp-kit/src/SafeOnRampKit.ts#L1) using `SafeSafeOnRampProviderType` and `SafeOnRampConfig` as parameters.

_With Stripe_

```typescript
const safeOnRamp = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
  onRampProviderConfig: {
    stripePublicKey: <You public key>, // You should get your own public and private keys from Stripe
    onRampBackendUrl: <Your backend url> // You should deploy your own server
  }
})
```

For the server you can use [this](https://github.com/safe-global/account-abstraction-sdk/blob/d56b46e44ea50221e0c63e2e96a62485ef72d903/packages/onramp-kit/example/server) as an example.

> Currently we are providing both the public key and the server for testing purposes. In the future you will use your own public key and server based on the final documentation Stripe will provide once their on ramps solution is ready for production. See the [considerations and limitations](#considerations-and-limitations) section for more details.

Once the instance is created, you can call the `open(SafeOnRampOpenOptions)` method to start the session with the provider and opening the widget.

As an example, you can use the following code:

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

1. The library is in development and it's not ready for production usage. We are working with Stripe and participating in the pilot testing for their new [on ramp solution](https://stripe.com/es/blog/crypto-onramp)

Given this, we are offering our public key and a deployed server for testing purposes so use it like this:

```typescript
const safeOnRamp = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
  onRampProviderConfig: {
    stripePublicKey:
      'pk_test_51MZbmZKSn9ArdBimSyl5i8DqfcnlhyhJHD8bF2wKrGkpvNWyPvBAYtE211oHda0X3Ea1n4e9J9nh2JkpC7Sxm5a200Ug9ijfoO', // Safe public key
    onRampBackendUrl: 'https://safe-onramp-backend.5afe.dev' // Safe deployed server
  }
})
```

```
const safeOnRamp = await SafeOnRampKit.init(new StripeAdapter({
    stripePublicKey:
      'pk_test_51MZbmZKSn9ArdBimSyl5i8DqfcnlhyhJHD8bF2wKrGkpvNWyPvBAYtE211oHda0X3Ea1n4e9J9nh2JkpC7Sxm5a200Ug9ijfoO', // Safe public key
    onRampBackendUrl: 'https://safe-onramp-backend.5afe.dev' // Safe deployed server
})
```

2. As we are working on stripe testmode, the purchases are being simulated. You can use the fake data in the [docs](https://stripe.com/docs/testing) and the [following test cards](https://stripe.com/docs/testing?testing-method=card-numbers#cards) to enter the required information in the embedded widget.

3. When testing with testnets as Mumbai in Polygon, the crypto assets will be transferred so PLEASE DO TRY TO USE LOWER AMOUNTS to preserve testnets liquidity, but ESPECIALLY WITH USDC ON POLYGON.

4. If you want to deploy a POC with your solution, bear in mind that our integration with Stripe has whitelisted the following domains:

- localhost: For local development
- [netlify.app](https://www.netlify.com) and [vercel.app](https://vercel.com) for production deployments

So you can deploy your solution in one of these hosting providers. With another domain outside those ones the widget will throw an error as we didn't whitelist it using our configuration.

5. Currently the Stripe widget can only be opened if you are based in the United States. If you are hacking from another country you can use a VPN. We can recommend for example [Proton VPN](https://protonvpn.com) as it have a free tier that should be enough for testing purposes. You need to connect to the United States server. As this has an impact on your bandwidth, we only recommend the free tier for testing purposes.
