import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(4000),
    SESSION_SECRET: Joi.string().required().description('Session secret key'),
    SESSION_EXPIRATION_DAYS: Joi.number()
      .default(1)
      .description('days after which session expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    NEXT_PUBLIC_SOCKET_URL: Joi.string().description('the url for the socket'),
    GOOGLE_CLIENT_ID: Joi.string().description('Google Client ID'),
    GOOGLE_CLIENT_SECRET: Joi.string().description('Google Client Secret'),
    GOOGLE_CALLBACK_URL: Joi.string().description('Google Callback URL'),
    CLIENT_URL: Joi.string().description('Client URL'),
    FRONTEND_TALENT_URL: Joi.string().description('Frontend Talent URL'),
    // Stripe Configuration Validation
    STRIPE_SECRET_KEY: Joi.string().required().description('Stripe secret key'),
    STRIPE_PUBLISHABLE_KEY: Joi.string().required().description('Stripe publishable key'),
    STRIPE_WEBHOOK_SECRET: Joi.string().required().description('Stripe webhook secret'),
    FRONTEND_URL: Joi.string().required().description('Frontend URL for Stripe redirects'),
    STRIPE_CURRENCY: Joi.string().default('usd').description('Default currency for Stripe'),
    STRIPE_PAYMENT_METHODS: Joi.string().default('card').description('Allowed payment methods'),
    LOKI_HOST: Joi.string().description('Loki host'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  socketUrl: envVars.NEXT_PUBLIC_SOCKET_URL,
  session: {
    secret: envVars.SESSION_SECRET,
    expirationDays: envVars.SESSION_EXPIRATION_DAYS,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    callbackUrl: envVars.GOOGLE_CALLBACK_URL,
  },
  clientUrl: envVars.CLIENT_URL,
  frontendTalentUrl: envVars.FRONTEND_TALENT_URL,
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    publishableKey: envVars.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
    currency: envVars.STRIPE_CURRENCY || 'usd',
    paymentMethods: (envVars.STRIPE_PAYMENT_METHODS || 'card').split(','),
    successUrl: `${envVars.FRONTEND_URL}/subscription/success`,
    cancelUrl: `${envVars.FRONTEND_URL}/subscription/cancel`,
  },
  loki: {
    host: envVars.LOKI_HOST,
  },
};
