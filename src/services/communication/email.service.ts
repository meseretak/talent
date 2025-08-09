import nodemailer from 'nodemailer';
import config from '../../config/config';
import logger from '../../config/logger';
import generateEmailHTML from '../../template/email';

const transporter = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
  logger.info('Initializing Brevo email service via SMTP');
}

/**
 * Send an email using Brevo SMTP
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent via Brevo SMTP: ${info.messageId}`);
    return info;
  } catch (error: any) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const htmlContent = generateEmailHTML('token', {
    code: token,
    expires: '10 minutes',
  });
  const text = `Dear user, To reset your password, click on this link: ${resetPasswordUrl}`;
  await sendEmail(to, subject, text, htmlContent);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const htmlContent = generateEmailHTML('token', {
    code: token,
    expires: '24 hours',
  });
  const text = `Dear user, To verify your email, click on this link: ${verificationEmailUrl}`;
  await sendEmail(to, subject, text, htmlContent);
};

/**
 * Send welcome email to new users
 * @param {string} to Email address of the recipient
 * @param {string} name Name of the recipient
 * @param {string} password The user's password (Security Risk)
 * @returns {Promise}
 */
const sendWelcomeEmail = async (to: string, name: string, password?: string) => {
  const subject = 'Welcome to Byfluence!'; // Customize brand name if needed
  // Define your frontend login URL - ideally from config
  const loginLink = config.frontendTalentUrl
    ? config.frontendTalentUrl
    : 'http://localhost:3000/talent/login'; // Replace with your actual frontend login URL or get from config

  const htmlContent = generateEmailHTML('welcome', {
    name,
    email: to,
    password, // Pass the password to the template
    brand: 'Byfluence', // Customize brand name
    loginLink: loginLink, // Pass the login link
  });
  // Basic text version (consider improving)
  const text = `Dear ${name},\n\nWelcome to Byfluence! Your account is ready.\nEmail: ${to}\n${
    password ? `Password: ${password}\n` : ''
  }\nYou can log in here: ${loginLink}\n\nBest regards,\nThe Byfluence Team`;

  await sendEmail(to, subject, text, htmlContent);
};

/**
 * Send project assignment notification
 * @param {string} to
 * @param {string} projectName
 * @param {string} role
 * @returns {Promise}
 */
const sendProjectAssignmentEmail = async (to: string, projectName: string, role: string) => {
  const subject = `New Project Assignment: ${projectName}`;
  const htmlContent = generateEmailHTML('project_update', {
    name: role,
    projectName,
    phase: 'New Assignment',
    projectLink: 'http://link-to-app/projects',
  });
  const text = `You have been assigned to the project "${projectName}" as ${role}.`;
  await sendEmail(to, subject, text, htmlContent);
};

/**
 * Send meeting invitation
 * @param {string} to
 * @param {Object} meetingDetails
 * @returns {Promise}
 */
const sendMeetingInvitation = async (
  to: string,
  meetingDetails: {
    title: string;
    date: Date;
    link: string;
  },
) => {
  const subject = `Meeting Invitation: ${meetingDetails.title}`;
  const htmlContent = generateEmailHTML('meeting', {
    topic: meetingDetails.title,
    date: meetingDetails.date.toLocaleDateString(),
    time: meetingDetails.date.toLocaleTimeString(),
    platform: 'Zoom',
    link: meetingDetails.link,
  });
  const text = `You have been invited to a meeting: ${meetingDetails.title}`;
  await sendEmail(to, subject, text, htmlContent);
};

/**
 * Send guest schedule confirmation
 * @param {string} to
 * @param {Object} scheduleDetails
 * @returns {Promise}
 */
const sendGuestScheduleConfirmation = async (
  to: string,
  scheduleDetails: {
    firstName: string;
    scheduledDate: Date;
    meetingType: string;
    meetingLink?: string;
  },
) => {
  const subject = 'Meeting Schedule Confirmation';
  const htmlContent = generateEmailHTML('meeting', {
    name: scheduleDetails.firstName,
    topic: scheduleDetails.meetingType,
    date: scheduleDetails.scheduledDate.toLocaleDateString(),
    time: scheduleDetails.scheduledDate.toLocaleTimeString(),
    platform: 'Zoom',
    link: scheduleDetails.meetingLink,
  });
  const text = `Dear ${scheduleDetails.firstName}, Your meeting has been scheduled.`;
  await sendEmail(to, subject, text, htmlContent);
};

/**
 * Send verification OTP email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise<void>}
 */
const sendVerificationOTP = async (to: string, otp: string): Promise<void> => {
  const subject = 'Email Verification';
  // You can use a template here
  const text = `Your verification code is: ${otp}. This code will expire in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Please use the following code to verify your email address:</p>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this verification, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, subject, text, html);
};

export default {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendProjectAssignmentEmail,
  sendMeetingInvitation,
  sendGuestScheduleConfirmation,
  sendVerificationOTP,
};
