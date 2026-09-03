export function generateOtp() {
  return Math.floor(10000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>

    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

      <div style="max-width: 500px; margin: 40px auto; background: white; padding: 30px; border-radius: 10px;">

        <h2 style="text-align: center;">Verify Your Email</h2>

        <p>Hello,</p>

        <p>
          Use the following OTP to verify your email address:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </span>
        </div>

        <p>
          This OTP will expire in <strong>5 minutes</strong>.
        </p>

        <p>
          If you didn't request this code, you can safely ignore this email.
        </p>

        <p>Regards,<br>Your App Team</p>

      </div>

    </body>
    </html>
  `;
}


