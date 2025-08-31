const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  let transporter;

  // In a real production app, you'd have more robust logic.
  // For this project, we'll use Mailtrap settings from .env if available,
  // otherwise, we log to the console.
  if (process.env.NODE_ENV === 'development' || !process.env.MAIL_HOST) {
    console.log('==================== EMAIL TO BE SENT ====================');
    console.log(`Recipient: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Body:');
    console.log(options.text);
    console.log('========================================================');
    // In a non-running environment, we can't send mail, so we just resolve.
    return Promise.resolve();
  }

  // Create a transporter object using SMTP transport
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: `"File Sharing Platform" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    // html: options.html
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendMail,
};
