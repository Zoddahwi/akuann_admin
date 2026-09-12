import nodemailer from "nodemailer";

/**
 * Studio-side mail. Mirrors the client web app's transport so both sides send
 * from the same Akuann Made address. Requires EMAIL_USER / EMAIL_PASS.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
  pool: true,
  maxConnections: 1,
  maxMessages: 5,
  rateDelta: 2000,
  rateLimit: 5,
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; path: string; cid?: string }[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: EmailOptions) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "EMAIL_USER / EMAIL_PASS are not configured — cannot send studio email."
    );
  }
  return transporter.sendMail({
    from: `"Akuann Made" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
    replyTo,
    attachments,
  });
}

/* ── Branded templates ──────────────────────────────────────────────────── */

const INK = "#232d3f";
const CHAMPAGNE = "#b2998a";
const WASH = "#fdfaf8";
const BORDER = "#f5ece6";

export const STUDIO_PHONE = "0541023362";
export const STUDIO_EMAIL = "akuanngh88@gmail.com";

function shell(title: string, body: string): string {
  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="cid:akuann-logo" alt="Akuann Made" style="width: 140px; height: auto; margin-bottom: 16px;" />
      <h2 style="color: ${INK}; font-size: 22px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${title}</h2>
      <p style="color: ${CHAMPAGNE}; font-size: 13px; margin-top: 6px;">Akuann Made • Bridal Couture</p>
    </div>
    ${body}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
      <p style="font-size: 11px; color: #999; line-height: 1.6;">
        Sophistication gracefully draped over contours.<br/>
        ${STUDIO_PHONE} • ${STUDIO_EMAIL}<br/>
        © ${new Date().getFullYear()} Akuann Made. All rights reserved.
      </p>
    </div>
  </div>`;
}

const P = `font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 20px;`;

/** Accepted → here is your consultation booking link. */
export function acceptanceEmail(args: {
  fullName: string;
  bookingUrl: string;
  expiresOn: string;
  note?: string | null;
}): string {
  return shell(
    "Your Consultation Invitation",
    `
    <p style="${P}">Dear <strong style="color: ${INK};">${args.fullName}</strong>,</p>
    <p style="${P}">
      Thank you for trusting Akuann Made with such an important gown. We have reviewed your
      submission and we would be delighted to take you on as a bridal client.
    </p>
    <p style="${P}">
      The next step is your private bridal consultation. Please use the link below to choose
      the date and time that suits you best.
    </p>
    ${
      args.note
        ? `<div style="background: ${WASH}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 20px; margin: 24px 0;">
             <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.7;"><strong style="color: ${INK};">A note from your designer:</strong><br/>${args.note}</p>
           </div>`
        : ""
    }
    <div style="margin: 36px 0; text-align: center;">
      <a href="${args.bookingUrl}" style="display: inline-block; background: ${CHAMPAGNE}; color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 100px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
        Book Your Consultation
      </a>
    </div>
    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.7;">
      This link is personal to you and is active until <strong>${args.expiresOn}</strong>.<br/>
      If it expires, simply reply to this email and we will send a fresh one.
    </p>
    <p style="${P}">
      There is nothing to prepare beforehand — <strong>your measurements are taken by our team
      during the consultation</strong>.
    </p>`
  );
}

/** Declined → gracious close. */
export function declineEmail(args: { fullName: string; note?: string | null }): string {
  return shell(
    "Regarding Your Enquiry",
    `
    <p style="${P}">Dear <strong style="color: ${INK};">${args.fullName}</strong>,</p>
    <p style="${P}">
      Thank you for considering Akuann Made for your wedding day, and for the care you took in
      sharing your vision with us.
    </p>
    <p style="${P}">
      After reviewing your submission, we are not able to take on your gown for this date.
      Each piece is made by hand within a limited production calendar, and we only accept work
      we can give the attention it deserves.
    </p>
    ${
      args.note
        ? `<div style="background: ${WASH}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 20px; margin: 24px 0;">
             <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.7;">${args.note}</p>
           </div>`
        : ""
    }
    <p style="${P}">
      We would be glad to hear from you again for a future date or a different occasion — please
      do reach out on ${STUDIO_PHONE}. We wish you a beautiful wedding.
    </p>`
  );
}

/** Sent when the designer re-issues a booking link. */
export function resendEmail(args: {
  fullName: string;
  bookingUrl: string;
  expiresOn: string;
}): string {
  return shell(
    "Your New Booking Link",
    `
    <p style="${P}">Dear <strong style="color: ${INK};">${args.fullName}</strong>,</p>
    <p style="${P}">
      Here is a fresh link to book your Akuann Made bridal consultation.
    </p>
    <div style="margin: 36px 0; text-align: center;">
      <a href="${args.bookingUrl}" style="display: inline-block; background: ${CHAMPAGNE}; color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 100px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
        Book Your Consultation
      </a>
    </div>
    <p style="font-size: 12px; color: #999; text-align: center;">
      Active until <strong>${args.expiresOn}</strong>.
    </p>`
  );
}
