const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'"'"'/g, "&#39;");

export const buildPasswordResetEmail = ({ name, resetUrl, appName = "NextCart" }) => {
  const safeName = escapeHtml(name || "there");
  const safeAppName = escapeHtml(appName);
  const safeUrl = encodeURI(resetUrl);

  return {
    subject: `Reset your ${safeAppName} password`,
    text: `Hello ${name || "there"},\n\nYou requested a password reset. To reset your password, visit this link: ${resetUrl}\n\nIf you did not request this, you can ignore this message.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px; color: #111827;">Hello ${safeName},</h2>
          <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">
            We received a request to reset your ${safeAppName} password. Use the button below to continue.
          </p>
          <p style="margin: 0 0 24px;">
            <a
              href="${safeUrl}"
              style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;"
            >
              Reset Password
            </a>
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you did not request this password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };
};

