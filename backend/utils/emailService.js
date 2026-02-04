// ============================================
// Email Service
// Function: Sends registration emails and application status notification emails.
// ============================================

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// dotenv: Loads environment variables
// Reads configuration (such as EMAIL_USER, EMAIL_PASS) from the .env file
dotenv.config();

// ============================================
// Creating a mail transporter
// Function: Configures the SMTP connection used for sending emails
// ============================================
const createTransporter = () => {
    return nodemailer.createTransport({
        // Uses Gmail's default configuration
        service: 'gmail',
        // Authentication information
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// ============================================
// Sends a registration token email to a new employee
// Parameters:
//   - to (string): Recipient's email address
//   - name (string): Recipient's name
//   - token (string): Registration token (64-bit hexadecimal string)
// Returns: Promise<{ success: boolean, messageId: string }>
// ============================================
export const sendRegistrationEmail = async (to, name, token) => {
    try {
        // Create a transmitter instance.
        const transporter = createTransporter();

        // Constructing the registration link
        // Example: http://localhost:5173/register?token=abc123...
        const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

        // Define the email content.
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject:'Welcome to Our Company - Complete Your Registration',
            // html: The email body in HTML format
            // Using inline CSS styles (because email clients do not support external CSS)
            html:`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <!-- 邮件标题 -->
                    <h2 style="color: #1890ff;">Welcome to Our Company!</h2>
                    
                    <!-- 问候语 -->
                    <p>Hi ${name},</p>
                    
                    <!-- 说明文字 -->
                    <p>You have been invited to join our company. Please complete your registration by clicking the link below:</p>
                    
                    <!-- 注册按钮 -->
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${registrationLink}" 
                           style="background-color: #1890ff; 
                                  color: white; 
                                  padding: 12px 30px; 
                                  text-decoration: none; 
                                  border-radius: 4px; 
                                  display: inline-block;">
                            Complete Registration
                        </a>
                    </div>
                    
                    <!-- 备用链接（如果按钮不工作） -->
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666; word-break: break-all;">${registrationLink}</p>
                    
                    <!-- 过期提示 -->
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        This link will expire in 3 days. If you did not expect this email, please ignore it.
                    </p>
                    
                    <!-- 分隔线 -->
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <!-- 签名 -->
                    <p style="color: #999; font-size: 12px;">
                        Best regards,<br>
                        HR Team
                    </p>
                </div>
            `
        };

        // Sending email
        // transporter.sendMail() returns a Promise
        // Upon success, it returns an info object containing:
        //   - messageId: Unique identifier of the email
        //   - accepted: List of accepted recipients
        //   - rejected: List of rejected recipients
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Registration email sent successfully:', info.messageId);

        return { success: true, messageId: info.messageId};

    } catch (err) {
        console.error('❌ Email sending failed:', err);
        throw new Error('Failed to send email: ' + err.message);
    }
};

// ============================================
// Sends an application status notification email (approved/rejected)
// Parameters:
//   - to (string): Recipient's email address
//   - name (string): Recipient's name
//   - status (string): Application status: "Approved" or "Rejected"
//   - feedback (string): HR feedback information (optional)
// Returns: Promise<{ success: boolean, messageId: string }>
// ============================================
export const sendApplicationStatusEmail = async (to, name, status, feedback) => {
    try {
        const transporter = createTransporter();
        // The email content is set differently depending on the status.
        let subject, message, statusColor;

        if (status === 'Approved') {
            subject = 'Congratulations! Your Application Has Been Approved';
            message = `
                <p>We are pleased to inform you that your onboarding application has been <strong style="color: #52c41a;">approved</strong>!</p>
                <p>You can now access your employee portal and complete your profile.</p>
            `;
            statusColor = '#52c41a';
        } else if (status === 'Rejected') {
            subject = 'Need Update on Your Application';
            message = `
                <p>Thank you for submitting your onboarding application. After careful review, we need you to make some updates.</p>
                <p><strong>Feedback:</strong> ${feedback || 'Please review your information and resubmit.'}</p>
                <p>Please log in to update your application.</p>
            `;
            statusColor = '#ff4d4f';
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${statusColor};">${subject}</h2>
                    
                    <p>Hi ${name},</p>
                    
                    ${message}
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/onboarding" 
                           style="background-color: #1890ff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            View Application
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px;">
                        Best regards,<br>
                        HR Team
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Status email sent successfully:', info.messageId);
        return { success: true, message: info.messageId};

    } catch (err) {
        console.error('❌ Status email sending failed:', err);
        throw new Error('Failed to send status email: ' + err.message);
    }
};

export default {
    sendRegistrationEmail,
    sendApplicationStatusEmail
};
