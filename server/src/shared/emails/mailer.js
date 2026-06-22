/**
 * mailer.js
 *
 * WHO CALLS IT:
 *   notifications/services/email.service.js exclusively. No other module
 *   touches Nodemailer directly — this mirrors the same isolation
 *   discipline payments/services/razorpay.service.js used for the
 *   Razorpay SDK: exactly one file in the codebase knows the underlying
 *   provider's API, everything else goes through a clean function call.
 *
 * WHY THIS LIVES IN shared/emails/, NOT INSIDE notifications/:
 *   This file is pure transport configuration (SMTP host, port,
 *   credentials) — it has zero knowledge of WHAT is being emailed or WHY.
 *   That is a deliberate separation: shared/emails/mailer.js answers "how
 *   do I send an email at all," while notifications/services/
 *   email.service.js answers "what does a welcome email say and when do
 *   we send one." If this project later needs to send a transactional
 *   email from somewhere outside the Notification module for some reason,
 *   this transporter is the one place that connection lives — consistent
 *   with shared/ being for code that belongs to no single module but is
 *   usable by any of them, exactly as established when shared/emails/
 *   was first scaffolded back in this project's folder-structure phase.
 *
 * INPUT:   None (reads SMTP config from process.env at module load)
 * OUTPUT:  A configured Nodemailer transporter instance
 */

import nodemailer from "nodemailer";

const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const emailPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
const emailSecure =
  process.env.SMTP_SECURE === "true" || emailPort === 465 || process.env.EMAIL_SECURE === "true";
const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const emailPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
const emailFrom =
  process.env.SMTP_FROM_ADDRESS || process.env.EMAIL_FROM_ADDRESS || `"NextCart" <${emailUser || "no-reply@nextcart.com"}>`;

// Constructed once at module load and reused across every send — creating
// a new transporter per email would mean re-establishing an SMTP
// connection on every single notification, which is unnecessary overhead
// at any meaningful email volume.
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailSecure, // true for port 465, false for 587/STARTTLS
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

// ─── Send Mail ────────────────────────────────────────────────────────────────
/**
 * The single function every email-sending call in this codebase routes
 * through. Kept deliberately thin — no template logic, no business
 * decisions about WHO to email or WHEN — those concerns belong entirely
 * to email.service.js. This function's only job is "given a fully
 * formed message, hand it to the SMTP provider."
 *
 * @param {Object} options       - { to, subject, html, text }
 * @returns {Object}             - Nodemailer's send result (messageId, etc.)
 * @throws                       - If the SMTP send itself fails — the
 *                                  caller (email.service.js) is
 *                                  responsible for catching this and
 *                                  marking the Notification "FAILED"
 *                                  rather than letting an unhandled
 *                                  rejection crash an otherwise-successful
 *                                  business operation (e.g. order creation
 *                                  succeeding even if its confirmation
 *                                  email fails to send).
 */
export const sendMail = async ({ to, subject, html, text }) => {
  return transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    html,
    text,
  });
};
