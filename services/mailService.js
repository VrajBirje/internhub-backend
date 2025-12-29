const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';

let transporter;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
} else {
    // Fallback to ethereal for development if creds not provided
    (async () => {
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.warn('No SMTP credentials found. Using Ethereal test account. Check logs for preview URLs.');
        } catch (err) {
            console.error('Failed to create test email account', err);
        }
    })();
}

async function sendMail({ to, subject, text, html }) {
    if (!transporter) throw new Error('Email transporter not configured');

    const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject,
        text,
        html
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, return preview URL
    if (nodemailer.getTestMessageUrl && process.env.SMTP_HOST === undefined) {
        info.previewUrl = nodemailer.getTestMessageUrl(info);
    }

    return info;
}

module.exports = {
    sendMail
};
