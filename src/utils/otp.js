function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpHtml(otp) {
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
        <p>Use the following OTP to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
        </div>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <p>Regards,<br>Your App Team</p>
      </div>
    </body>
    </html>
  `;
}

function getDebitAlertHtml({ senderName, amount, transactionId, receiverName }) {
  const currentDate = new Date().toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Debit Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f6f9;">
      <div style="max-width: 500px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
        <h2 style="text-align: center; color: #dc3545; margin-top: 0;">Transaction Alert: Debit</h2>
        <p>Hello <strong>${senderName}</strong>,</p>
        <p>Aap ke account se raqam kamyabi ke sath deduct kar li gayi hai.</p>
        <div style="text-align: center; margin: 25px 0; background-color: #fff5f5; padding: 15px; border-radius: 8px;">
          <span style="font-size: 14px; color: #6c757d; display: block; text-transform: uppercase;">Amount Deducted</span>
          <span style="font-size: 30px; font-weight: bold; color: #dc3545;">- PKR ${amount}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 0; color: #6c757d; font-size: 14px;">Transaction ID</td>
            <td style="padding: 10px 0; color: #212529; font-size: 14px; font-weight: bold; text-align: right;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6c757d; font-size: 14px; border-top: 1px dashed #e9ecef;">Transferred To</td>
            <td style="padding: 10px 0; color: #212529; font-size: 14px; font-weight: bold; text-align: right;">${receiverName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6c757d; font-size: 14px; border-top: 1px dashed #e9ecef;">Date & Time</td>
            <td style="padding: 10px 0; color: #212529; font-size: 14px; font-weight: bold; text-align: right;">${currentDate}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #868e96; line-height: 1.5;">Agar yeh transaction aap ne nahi ki, to foran support team se rabta karein.</p>
        <p style="margin-top: 25px;">Regards,<br><strong>Your Banking Team</strong></p>
      </div>
    </body>
    </html>
  `;
}

function getCreditAlertHtml({ receiverName, amount, transactionId, senderName }) {
  const currentDate = new Date().toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Credit Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f6f9;">
      <div style="max-width: 500px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
        <h2 style="text-align: center; color: #28a745; margin-top: 0;">Transaction Alert: Credit</h2>
        <p>Hello <strong>${receiverName}</strong>,</p>
        <p>Aap ke account mein raqam kamyabi ke sath jama (credit) kar di gayi hai.</p>
        <div style="text-align: center; margin: 25px 0; background-color: #f0fff4; padding: 15px; border-radius: 8px;">
          <span style="font-size: 14px; color: #6c757d; display: block; text-transform: uppercase;">Amount Credited</span>
          <span style="font-size: 30px; font-weight: bold; color: #28a745;">+ PKR ${amount}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 0; color: #6c757d; font-size: 14px;">Transaction ID</td>
            <td style="padding: 10px 0; color: #212529; font-size: 14px; font-weight: bold; text-align: right;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6c757d; font-size: 14px; border-top: 1px dashed #e9ecef;">Received From</td>
            <td style="padding: 10px 0; color: #212529; font-size: 14px; font-weight: bold; text-align: right;">${senderName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6c757d; font-size: 14px; border-top: 1px dashed #e9ecef;">Date & Time</td>
            <td style="padding: 10px 0; color: #212529; font-size: 14px; font-weight: bold; text-align: right;">${currentDate}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #868e96; line-height: 1.5;">Yeh raqam aap ke account balance mein add kar di gayi hai. Agar koi masla ho to support team se rabta karein.</p>
        <p style="margin-top: 25px;">Regards,<br><strong>Your Banking Team</strong></p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  generateOtp,
  getOtpHtml,
  getDebitAlertHtml,
  getCreditAlertHtml,
};