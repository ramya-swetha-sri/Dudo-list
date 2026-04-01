import nodemailer from 'nodemailer';

// Create transporter - using Gmail or any email service
// For development, you can use ethereal email (temporary)
// For production, use your email service credentials
const createTransporter = () => {
  // Using environment variables for email configuration
  const transport = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // If no email credentials provided, create a test account
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials not configured. Using test mode.');
    return null;
  }

  return nodemailer.createTransport(transport);
};

const transporter = createTransporter();

export const sendFriendRequestEmail = async (friendEmail, requesterName, requesterEmail) => {
  if (!transporter) {
    console.log(`📧 [TEST MODE] Friend request email would be sent to: ${friendEmail}`);
    console.log(`   From: ${requesterName} (${requesterEmail})`);
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: friendEmail,
      subject: `${requesterName} wants to be your friend on DuoTask! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🚀 DuoTask Friend Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hey! 👋 <strong>${requesterName}</strong> wants to connect with you on DuoTask!
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Accept their friend request to:
            </p>
            
            <ul style="color: #666; font-size: 14px; line-height: 1.8;">
              <li>👀 See their tasks and progress</li>
              <li>💪 Motivate each other to complete goals</li>
              <li>🏆 Compete on the leaderboard</li>
              <li>🎵 Enjoy group tasks together</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/friend-tasks" 
                 style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Friend Request
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              This is an automated message from DuoTask. If you don't recognize ${requesterName}, 
              you can safely ignore this email or respond to let us know.
            </p>
          </div>
        </div>
      `,
      text: `${requesterName} wants to be your friend on DuoTask! Visit ${process.env.FRONTEND_URL || 'http://localhost:5173'} to view their request.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${friendEmail}:`, info.response);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${friendEmail}:`, error.message);
    return false;
  }
};

export const sendFriendRequestAcceptedEmail = async (requesterEmail, acceptorName) => {
  if (!transporter) {
    console.log(`📧 [TEST MODE] Friend request accepted email would be sent to: ${requesterEmail}`);
    console.log(`   Message: ${acceptorName} accepted your friend request`);
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: requesterEmail,
      subject: `Great news! ${acceptorName} accepted your friend request! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Friend Request Accepted!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Awesome! 🎉 <strong>${acceptorName}</strong> has accepted your friend request on DuoTask!
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Now you can:
            </p>
            
            <ul style="color: #666; font-size: 14px; line-height: 1.8;">
              <li>👀 View their tasks and progress</li>
              <li>💬 Stay motivated together</li>
              <li>🏆 Track your positions on the leaderboard</li>
              <li>🎵 Join group tasks together</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/friend-tasks" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Your Friends
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              This is an automated message from DuoTask. Keep crushing those tasks! 💪
            </p>
          </div>
        </div>
      `,
      text: `Great news! ${acceptorName} accepted your friend request. Visit DuoTask to connect!`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${requesterEmail}:`, info.response);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${requesterEmail}:`, error.message);
    return false;
  }
};
