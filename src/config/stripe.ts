import Stripe from 'stripe';
import config from './config';

if (!config.stripe.secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-04-30.basil', // Updated API version
  typescript: true,
  appInfo: {
    name: 'Byfluence Video Production',
    version: '1.0.0',
  },
  telemetry: false,
});

// Webhook signing secret for verifying webhook events
export const webhookSecret = config.stripe.webhookSecret;

// Helper function to format amount to cents
export const formatAmountForStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};

// Helper function to format amount from cents
export const formatAmountFromStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : amount / 100;
};

export { stripe };
