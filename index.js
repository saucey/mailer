const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

const smtpUser = 'info@glenscott.tech';
const smtpPass = 'Click1986!';

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'mail.glenscott.tech',
  port: 587,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
    method: 'LOGIN',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function generateTemplate({ name, email, message }) {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #1b3f60; padding: 20px; text-align: center;">
          <h1 style="color: #CDF27E!important; margin: 0;">Glenscott.tech</h1>
          <p style="color: #ffffff; margin: 4px 0 0;">New Customer Message</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333333;">You've received a new message via the website:</p>
          <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p style="font-size: 15px; color: #555555; line-height: 1.6; margin-top: 20px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 13px; color: #888888; margin: 0;">
            &copy; ${new Date().getFullYear()} Glenscott.tech · 
            <a href="https://glenscott.tech" style="color: #1b3f60; text-decoration: none;">glenscott.tech</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

app.post('/api/send-email', async (req, res) => {
  const authHeader = req.headers['17321653f7b1a9a49d756823f18b7603527c3d57d55cc73d7cd9e3bca30e1538'];


  if (authHeader !== process.env.GLENSCOTT_MAILER_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { name, email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const mailOptions = {
    from: `"${name || 'Website Visitor'}" <${smtpUser}>`,
    to: smtpUser,
    subject: subject,
    replyTo: email,
    html: generateTemplate({ name, email, message }),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('❌ Email send error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

// Fallback test endpoint using same template
app.get('/api/test-email', async (req, res) => {
  const authHeader = req.headers['17321653f7b1a9a49d756823f18b7603527c3d57d55cc73d7cd9e3bca30e1538'];

  if (authHeader !== process.env.GLENSCOTT_MAILER_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const fallbackTestData = {
    name: 'Fallback Tester',
    email: 'tester@glenscott.tech',
    subject: '✅ Fallback Test Email',
    message: 'This is a fallback test email sent from the backend without frontend input.',
  };

  const mailOptions = {
    from: `"${fallbackTestData.name}" <${smtpUser}>`,
    to: smtpUser,
    subject: fallbackTestData.subject,
    replyTo: fallbackTestData.email,
    html: generateTemplate(fallbackTestData),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Fallback test email sent.', messageId: info.messageId });
  } catch (err) {
    console.error('❌ Fallback email error:', err);
    res.status(500).json({ success: false, error: 'Fallback test email failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Email API listening at http://localhost:${PORT}`);
});
