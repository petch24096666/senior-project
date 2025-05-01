// src/services/emailService.js

import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const senderEmail = process.env.EMAIL_SENDER; // เช่น no-reply@yourdomain.com

sgMail.setApiKey(sendgridApiKey);

export const sendInvitationEmail = async (meetingTitle, meetingDate, meetingTime, joinUrl, participants) => {
  try {
    const msg = {
      to: participants, // ส่งหลายคนได้เลย
      from: senderEmail,
      subject: `Meeting Invitation: ${meetingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
          <h2>You're invited to a meeting</h2>
          <p><strong>Title:</strong> ${meetingTitle}</p>
          <p><strong>Date:</strong> ${meetingDate}</p>
          <p><strong>Time:</strong> ${meetingTime}</p>
          <p><strong>Join here:</strong> <a href="${joinUrl}" target="_blank">${joinUrl}</a></p>
          <p>We look forward to your participation!</p>
        </div>
      `
    };

    await sgMail.sendMultiple(msg);
    console.log('Invitation email sent successfully!');
  } catch (error) {
    console.error('Failed to send invitation email:', error.response?.body || error.message);
    throw error;
  }
};
