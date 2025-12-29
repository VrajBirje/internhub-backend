// scripts/sendTestEmail.js
require('dotenv').config();

const { sendMail } = require('../services/mailService');

async function run() {
    try {
        const to = 'vrajbirje0309@gmail.com';
        const subject = 'InternHub — Test Email';
        const html = `<p>Hello,</p><p>This is a test email from your InternHub backend.</p><p>If you received this, your SMTP configuration is working.</p>`;
        const text = 'This is a test email from your InternHub backend.';

        const info = await sendMail({ to, subject, html, text });
        console.log('Email sent:', info.messageId || info);
        if (info.previewUrl) console.log('Preview URL:', info.previewUrl);
    } catch (err) {
        console.error('Failed to send test email:', err.message || err);
        process.exitCode = 1;
    }
}

run();


// to send test email: node scripts/sendTestEmail.js 
