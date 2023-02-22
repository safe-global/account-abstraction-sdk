# How to use

Create an instance of the SafeOnRampKit class and pass the `SafeSafeOnRampProviderType` and the `SafeOnRampConfig` object as parameters.

```typescript
const safeOnRamp = await SafeOnRampKit.init(SafeOnRampProviderType.Stripe, {
  onRampProviderConfig: {
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    safeOnRampBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL
  }
})
```

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
