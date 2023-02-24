type eventCallback = (eventData: SafeOnRampEvent) => void

export interface SafeOnRampEventHandlers {
  onLoaded?: () => void
  onPaymentSuccessful?: eventCallback
  onPaymentError?: eventCallback
  onPaymentProcessing?: eventCallback
}

export interface SafeOnRampEvent {
  txId: string
  walletAddress: string
  totalFee: string
  totalAmount: string
  destination: {
    asset?: string
    amount: string | null
    network?: string
  }
  source: {
    asset?: string
    amount: string | null
    network?: string
  }
}
