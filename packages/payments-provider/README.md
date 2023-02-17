# How to use

Create an instance of the SafePayments class and pass the `SafePaymentsProviderType` and the `SafePaymentsConfig` object as parameters.

```typescript
const safePayments = await SafePayments.init(SafePaymentsProviderType.Stripe, {
  paymentsProviderConfig: {
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    safePaymentsBackendUrl: import.meta.env.VITE_SAFE_STRIPE_BACKEND_BASE_URL
  }
})
```

Once the instance is created, you can call the `open` method to start the session with the provider and open the widget.

You should pass an object with the `SafePaymentsOpenOptions`

```typescript
await safePayments.open({
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
