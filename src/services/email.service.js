const nodemailer = require("nodemailer");
const { getDebitAlertHtml, getCreditAlertHtml } = require("../utils/otp");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error.message);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank App Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

const sendDebitAlert = async ({
  senderEmail,
  senderName,
  amount,
  transactionId,
  receiverName,
}) => {
  try {
    const html = getDebitAlertHtml({
      senderName,
      amount,
      transactionId,
      receiverName,
    });

    const subject = `Debit Alert: PKR ${amount} Deducted`;
    const text = `Hello ${senderName}, aapke account se PKR ${amount} deduct ho chukay hain. Receiver: ${receiverName}, Transaction ID: ${transactionId}`;

    return await sendEmail(senderEmail, subject, text, html);
  } catch (error) {
    console.error("Debit alert email failed:", error.message);
  }
};

const sendCreditAlert = async ({
  receiverEmail,
  receiverName,
  amount,
  transactionId,
  senderName,
}) => {
  try {
    const html = getCreditAlertHtml({
      receiverName,
      amount,
      transactionId,
      senderName,
    });

    const subject = `Credit Alert: PKR ${amount} Received`;
    const text = `Hello ${receiverName}, aapke account mein PKR ${amount} credit ho chukay hain. Sender: ${senderName}, Transaction ID: ${transactionId}`;

    return await sendEmail(receiverEmail, subject, text, html);
  } catch (error) {
    console.error("Credit alert email failed:", error.message);
  }
};

module.exports = {
  sendEmail,
  sendCreditAlert,
  sendDebitAlert,
};