interface EmailData {
  brand?: string;
  name?: string;
  dashboardLink?: string; // Can be repurposed for login link
  code?: string;
  expires?: string;
  topic?: string;
  date?: string;
  time?: string;
  platform?: string;
  link?: string;
  rescheduleLink?: string;
  projectName?: string;
  updateMessage?: string;
  phase?: string;
  nextMilestone?: string;
  dueDate?: string;
  projectLink?: string;
  subject?: string;
  message?: string;
  ctaLink?: string; // Can also be used for login link
  ctaText?: string;
  unsubscribeLink?: string;
  preferencesLink?: string;
  email?: string;
  password?: string; // Security Risk: Avoid sending passwords in email if possible
  loginLink?: string; // Explicit field for login link
  subscriptionPlan?: string;
  credits?: number;
  brandSlots?: string | number;
  validUntil?: string;
  remainingCredits?: number;
  usedCredits?: number;
  transactionId?: string;
  amount?: number;
  currency?: string;
  referralCode?: string;
  referralCredits?: number;
  newPlan?: string;
  oldPlan?: string;
  newCredits?: number;
  newBrandSlots?: string | number;
  newValidUntil?: string;
  expiresAt?: string;
  referredEmail?: string;
  brands?: number;
  duration?: number;
  paymentLink?: string;
  supportEmail?: string;
  expiryDate?: string;
  clientName?: string;
  clientEmail?: string;
  requestId?: string;
  requestedCredits?: number;
  requestedBrands?: number;
  durationMonths?: number;
}

type EmailType =
  | 'welcome'
  | 'otp'
  | 'token'
  | 'meeting'
  | 'project_update'
  | 'custom'
  | 'subscription_confirmation'
  | 'credit_allocation'
  | 'low_credits'
  | 'referral_reward'
  | 'subscription_renewal'
  | 'subscription_upgrade'
  | 'custom_plan_payment'
  | 'custom_plan_confirmation'
  | 'payment_failure'
  | 'custom_plan_request_notification'
  | 'custom_plan_approval';

function generateEmailHTML(type: EmailType, data: EmailData = {}) {
  const styles = {
    container: `
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      max-width: 600px;
      margin: auto;
    `,
    header: `
      background-color:rgb(52, 176, 243);
      padding: 24px 40px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    `,
    logo: `
      max-height: 40px;
      margin-bottom: 16px;
    `,
    mainContent: `
      background-color: #ffffff;
      padding: 40px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    `,
    heading: `
      color: rgb(52, 176, 243);
      font-size: 24px;
      margin-bottom: 24px;
      font-weight: 700;
      line-height: 1.3;
    `,
    button: `
      background-color: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      margin-top: 24px;
      transition: all 0.2s ease;
    `,
    paragraph: `
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
      color: #475569;
    `,
    code: `
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #3b82f6;
      padding: 16px 24px;
      background: #f1f5f9;
      border-radius: 8px;
      display: inline-block;
      margin: 16px 0;
    `,
    infoBox: `
      background: #f8fafc;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin: 24px 0;
    `,
    footer: `
      text-align: center;
      padding: 32px 40px;
      font-size: 14px;
      color: #64748b;
    `,
    divider: `
      height: 1px;
      background-color: #e2e8f0;
      margin: 20px 0;
    `,
    socialLinks: `
      margin: 20px 0;
    `,
    socialIcon: `
      margin: 0 8px;
      text-decoration: none;
      color: #64748b;
    `,
  };

  // Common header for all emails
  const header = `
    <div style="${styles.header}">
      <img src="${data.brand ? `${data.brand}-logo.png` : 'https://your-default-logo.png'}" 
           alt="${data.brand || 'Company'} Logo" 
           style="${styles.logo}">
    </div>
  `;

  // Common footer for all emails
  const footer = `
    <div style="${styles.footer}">
      <div style="${styles.socialLinks}">
        <a href="#" style="${styles.socialIcon}">LinkedIn</a> •
        <a href="#" style="${styles.socialIcon}">Twitter</a> •
        <a href="#" style="${styles.socialIcon}">Instagram</a>
      </div>
      <div style="${styles.divider}"></div>
      <p>&copy; ${new Date().getFullYear()} ${
    data.brand || 'Your Company'
  }. All rights reserved.</p>
      <p style="margin-top: 12px; font-size: 12px;">
        <a href="${
          data.unsubscribeLink || '#'
        }" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a> •
        <a href="${
          data.preferencesLink || '#'
        }" style="color: #94a3b8; text-decoration: none;">Email Preferences</a>
      </p>
    </div>
  `;

  let content = '';

  switch (type) {
    case 'welcome':
      // Security Warning: Sending password in email is insecure.
      content = `
        <h1 style="${styles.heading}">Welcome to ${data.brand || 'Our Platform'} 👋</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${
          styles.paragraph
        }">We're excited to have you join our community! Your account has been created successfully.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Your Login Details</h3>
          <p style="${styles.paragraph}"><strong>Email:</strong> ${data.email || 'Not provided'}</p>
          ${
            data.password
              ? `<p style="${styles.paragraph}"><strong>Password:</strong> ${data.password} <br><small style="color: #ef4444;">(For security, please change this password after your first login if it was generated for you. Never share your password.)</small></p>`
              : ''
          }
          <p style="${
            styles.paragraph
          }">You can now log in to your account using the link below:</p>
        </div>
        <a href="${data.loginLink || '#'}" style="${styles.button}">Login to Your Account</a>
        <p style="${
          styles.paragraph
        }">If you have any questions, feel free to contact our support team.</p>
      `;
      break;

    case 'otp':
    case 'token':
      content = `
        <h1 style="${styles.heading}">Verify Your Account</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${
          styles.paragraph
        }">Please use the verification code below to complete your authentication:</p>
        <div style="text-align: center;">
          <p style="${styles.code}">${data.code || '000000'}</p>
        </div>
        <p style="${styles.paragraph}">This code will expire in ${data.expires || '10 minutes'}.</p>
        <div style="${styles.infoBox}">
          <p style="margin: 0; color: #64748b;">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email or contact support.
          </p>
        </div>
      `;
      break;

    case 'meeting':
      content = `
        <h1 style="${styles.heading}">🎥 Meeting Invitation</h1>
        <p style="${styles.paragraph}">Hello ${data.name || 'there'},</p>
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0;">Meeting Details</h3>
          <p style="margin: 8px 0;"><strong>Topic:</strong> ${data.topic || 'Creative Session'}</p>
          <p style="margin: 8px 0;"><strong>Date:</strong> ${data.date || 'TBD'}</p>
          <p style="margin: 8px 0;"><strong>Time:</strong> ${data.time || 'TBD'}</p>
          <p style="margin: 8px 0;"><strong>Platform:</strong> ${data.platform || 'Zoom'}</p>
        </div>
        ${data.link ? `<a href="${data.link}" style="${styles.button}">Join Meeting</a>` : ''}
        <p style="${styles.paragraph}">Need to reschedule? <a href="${
        data.rescheduleLink || '#'
      }" style="color: #fbb03b;">Click here</a></p>
      `;
      break;

    case 'project_update':
      content = `
        <h1 style="${styles.heading}">Project Update: ${data.projectName || 'Your Project'}</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${styles.paragraph}">${
        data.updateMessage || 'There has been an update to your project.'
      }</p>
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0;">Project Status</h3>
          <p style="margin: 8px 0;"><strong>Current Phase:</strong> ${
            data.phase || 'In Progress'
          }</p>
          <p style="margin: 8px 0;"><strong>Next Milestone:</strong> ${
            data.nextMilestone || 'Upcoming'
          }</p>
          <p style="margin: 8px 0;"><strong>Due Date:</strong> ${data.dueDate || 'TBD'}</p>
        </div>
        <a href="${data.projectLink || '#'}" style="${styles.button}">View Project Details</a>
      `;
      break;

    case 'custom':
    default:
      content = `
        <h1 style="${styles.heading}">${data.subject || 'Hey there!'}</h1>
        <p style="${styles.paragraph}">${
        data.message || "We're here to help bring your creative vision to life."
      }</p>
        ${
          data.ctaLink
            ? `<a href="${data.ctaLink}" style="${styles.button}">${
                data.ctaText || 'Learn More'
              }</a>`
            : ''
        }
      `;
      break;

    case 'subscription_confirmation':
      content = `
        <h1 style="${styles.heading}">Subscription Confirmed! 🎉</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${styles.paragraph}">Thank you for subscribing to our ${
        data.subscriptionPlan || 'premium'
      } plan.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Subscription Details</h3>
          <p style="${styles.paragraph}"><strong>Plan:</strong> ${data.subscriptionPlan}</p>
          <p style="${styles.paragraph}"><strong>Credits:</strong> ${data.credits} credits</p>
          <p style="${styles.paragraph}"><strong>Brand Slots:</strong> ${data.brandSlots} slots</p>
          <p style="${styles.paragraph}"><strong>Valid Until:</strong> ${data.validUntil}</p>
          <p style="${styles.paragraph}"><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p style="${styles.paragraph}"><strong>Amount Paid:</strong> ${data.currency}${
        data.amount
      }</p>
        </div>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">View Dashboard</a>
      `;
      break;

    case 'credit_allocation':
      content = `
        <h1 style="${styles.heading}">Credits Added to Your Account 💫</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${styles.paragraph}">We've successfully added credits to your account.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Credit Details</h3>
          <p style="${styles.paragraph}"><strong>Added Credits:</strong> ${data.credits} credits</p>
          <p style="${styles.paragraph}"><strong>Total Balance:</strong> ${
        data.remainingCredits
      } credits</p>
          <p style="${styles.paragraph}"><strong>Transaction ID:</strong> ${data.transactionId}</p>
        </div>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">View Credits</a>
      `;
      break;

    case 'low_credits':
      content = `
        <h1 style="${styles.heading}">Low Credits Alert ⚠️</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${styles.paragraph}">Your credit balance is running low.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Current Status</h3>
          <p style="${styles.paragraph}"><strong>Remaining Credits:</strong> ${
        data.remainingCredits
      } credits</p>
          <p style="${styles.paragraph}"><strong>Used Credits:</strong> ${
        data.usedCredits
      } credits</p>
        </div>
        <p style="${
          styles.paragraph
        }">To ensure uninterrupted service, please purchase additional credits.</p>
        <a href="${data.ctaLink || '#'}" style="${styles.button}">Purchase Credits</a>
      `;
      break;

    case 'referral_reward':
      content = `
        <h1 style="${styles.heading}">Referral Reward Earned! 🎁</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${
          styles.paragraph
        }">Great news! Someone has subscribed using your referral code.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Reward Details</h3>
          <p style="${styles.paragraph}"><strong>Referral Code:</strong> ${data.referralCode}</p>
          <p style="${styles.paragraph}"><strong>Credits Earned:</strong> ${
        data.referralCredits
      } credits</p>
          <p style="${styles.paragraph}"><strong>New Balance:</strong> ${
        data.remainingCredits
      } credits</p>
        </div>
        <p style="${styles.paragraph}">Keep sharing your referral code to earn more rewards!</p>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">View Dashboard</a>
      `;
      break;
    case 'subscription_renewal':
      content = `
        <h1 style="${styles.heading}">Subscription Renewed Successfully ✅</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${styles.paragraph}">Your subscription to the ${
        data.subscriptionPlan || 'premium'
      } plan has been successfully renewed.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Subscription Details</h3>
          <p style="${styles.paragraph}"><strong>Plan:</strong> ${
        data.subscriptionPlan || 'Premium'
      }</p>
          <p style="${styles.paragraph}"><strong>Credits:</strong> ${data.credits || 0} credits</p>
          <p style="${styles.paragraph}"><strong>Brand Slots:</strong> ${
        data.brandSlots || 0
      } slots</p>
          <p style="${styles.paragraph}"><strong>Valid Until:</strong> ${
        data.validUntil || 'N/A'
      }</p>
          ${
            data.transactionId
              ? `<p style="${styles.paragraph}"><strong>Transaction ID:</strong> ${data.transactionId}</p>`
              : ''
          }
        </div>
        <p style="${
          styles.paragraph
        }">Your account has been credited with fresh credits for the new billing period. You can now continue using our services without interruption.</p>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">View Dashboard</a>
      `;
      break;

    case 'subscription_upgrade':
      content = `
        <h1 style="${styles.heading}">Subscription Upgraded! 🚀</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${
          styles.paragraph
        }">Great news! Your subscription has been successfully upgraded from ${
        data.oldPlan || 'your previous plan'
      } to ${data.newPlan || 'a higher tier plan'}.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">New Plan Details</h3>
          <p style="${styles.paragraph}"><strong>Plan:</strong> ${
        data.newPlan || data.subscriptionPlan || 'Premium'
      }</p>
          <p style="${styles.paragraph}"><strong>Credits:</strong> ${
        data.newCredits || data.credits || 0
      } credits</p>
          <p style="${styles.paragraph}"><strong>Brand Slots:</strong> ${
        data.newBrandSlots || data.brandSlots || 0
      } slots</p>
          <p style="${styles.paragraph}"><strong>Valid Until:</strong> ${
        data.validUntil || 'N/A'
      }</p>
          ${
            data.transactionId
              ? `<p style="${styles.paragraph}"><strong>Transaction ID:</strong> ${data.transactionId}</p>`
              : ''
          }
        </div>
        <p style="${
          styles.paragraph
        }">With your upgraded plan, you now have access to more features and resources. Explore your new capabilities today!</p>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">Explore Your New Plan</a>
      `;
      break;

    case 'custom_plan_request_notification':
      content = `
        <h1 style="${styles.heading}">New Custom Plan Request 📝</h1>
        <p style="${styles.paragraph}">Hello Admin,</p>
        <p style="${styles.paragraph}">A new custom plan request has been submitted by a client.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Request Details</h3>
          <p style="${styles.paragraph}"><strong>Client Name:</strong> ${
        data.clientName || 'Not provided'
      }</p>
          <p style="${styles.paragraph}"><strong>Client Email:</strong> ${
        data.clientEmail || 'Not provided'
      }</p>
          <p style="${styles.paragraph}"><strong>Request ID:</strong> ${
        data.requestId || 'Not provided'
      }</p>
          <p style="${styles.paragraph}"><strong>Requested Credits:</strong> ${
        data.requestedCredits || 0
      }</p>
          <p style="${styles.paragraph}"><strong>Requested Brands:</strong> ${
        data.requestedBrands || 0
      }</p>
          <p style="${styles.paragraph}"><strong>Duration (months):</strong> ${
        data.durationMonths || 0
      }</p>
        </div>
        <p style="${styles.paragraph}">Please review this request and take appropriate action.</p>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">Review Request</a>
      `;
      break;

    case 'custom_plan_approval':
      content = `
        <h1 style="${styles.heading}">Custom Plan Request Approved ✅</h1>
        <p style="${styles.paragraph}">Hi ${data.name || 'there'},</p>
        <p style="${styles.paragraph}">Great news! Your custom plan request has been approved.</p>
        <div style="${styles.infoBox}">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">Plan Details</h3>
          <p style="${styles.paragraph}"><strong>Request ID:</strong> ${
        data.requestId || 'Not provided'
      }</p>
          <p style="${styles.paragraph}"><strong>Credits:</strong> ${data.requestedCredits || 0}</p>
          <p style="${styles.paragraph}"><strong>Brand Slots:</strong> ${
        data.requestedBrands || 0
      }</p>
          <p style="${styles.paragraph}"><strong>Duration:</strong> ${
        data.durationMonths || 0
      } months</p>
        </div>
        <p style="${
          styles.paragraph
        }">You can now proceed to payment to activate your custom plan.</p>
        <a href="${data.dashboardLink || '#'}" style="${styles.button}">Proceed to Payment</a>
      `;
      break;
  }

  return `
    <div style="${styles.container}">
      ${header}
      <div style="${styles.mainContent}">
        ${content}
      </div>
      ${footer}
    </div>
  `;
}

export default generateEmailHTML;
