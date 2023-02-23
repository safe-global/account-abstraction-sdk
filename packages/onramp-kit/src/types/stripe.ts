interface QuoteCurrency {
  id: string
  asset_code: string
  asset_display_name: string
  currency_minor_units: number
  currency_network: string
  currency_symbol: string
  currency_symbol_location: string
}

interface Fees {
  network_fee: string
  network_fee_monetary: string
  total_fee: string
  transaction_fee: string
  transaction_fee_monetary: string
}

interface Quote {
  blockchain_tx_id: string
  destination_amount: string | null
  destination_crypto_amount: string | null
  destination_currency: QuoteCurrency | null
  expiration: number
  fees: Fees
  fixed_currency_side: string
  source_amount: string | null
  source_currency: QuoteCurrency | null
  source_monetary_amount: string | null
  time_to_expiration: number
  total_amount: string
}

interface FixedTransactionDetails {
  destination_amount: string | null
  destination_crypto_amount: string | null
  destination_currency: string | null
  destination_network: string | null
  lock_wallet_address: boolean
  source_amount: string | null
  source_currency: string | null
  source_monetary_amount: string | null
  supported_destination_currencies: string[]
  supported_destination_networks: string[]
  wallet_address: string
  wallet_addresses: any
}

interface Session {
  id: string
  object: string
  livemode: boolean
  client_secret: string
  quote: Quote
  wallet_address: string
  fixed_transaction_details: FixedTransactionDetails
  status: string
}

interface Payload {
  session: Session
}

export interface OnrampSessionUpdatedEvent {
  type: string
  payload: Payload
}

export interface StripeProviderConfig {
  stripePublicKey: string
  onRampBackendUrl: string
}

export interface StripeSession {
  mount: (element: string) => void
  addEventListener: (event: string, callback: (e: any) => void) => void
  removeEventListener: (event: string, callback: (e: any) => void) => void
}
