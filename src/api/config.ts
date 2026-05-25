import { apiFetch } from './client'

export interface PaymentConfig {
  promptpay_number: string
  promptpay_name: string
  promptpay_qr_url: string
}

export function getPaymentConfig(): Promise<PaymentConfig> {
  return apiFetch('/api/v1/config/payment')
}
