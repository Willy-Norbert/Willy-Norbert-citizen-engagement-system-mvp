
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Configure email transport
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: true
});


// Get User model
const User = mongoose.model('User');

// Format date nicely
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Send OTP email
exports.sendOtpEmail = async (userEmail, otp) => {
  const mailOptions = {
    from: '"Citizen Engagement System" <willynorbert53@gmail.com>',
    to: userEmail,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="text-align: center; letter-spacing: 5px; color: #4a6ee0; font-size: 32px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <hr>
        <p style="color: #777; font-size: 12px; text-align: center;">Citizen Engagement System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

// Send complaint confirmation email
exports.sendComplaintConfirmation = async (complaint, department) => {
  try {
    // Get user details
    const user = await User.findById(complaint.userId);
    
    // Check if user wants to receive notifications
    if (!user || !user.emailNotifications) {
      return { success: false, message: "User has disabled notifications" };
    }
    
    const departmentName = department ? department.name : 'Unassigned';
    
    const mailOptions = {
      from: '"Citizen Engagement System" <willynorbert53@gmail.com>',
      to: user.email,
      subject: `Complaint Submitted - Ticket #${complaint._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Complaint Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Your complaint has been successfully submitted. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Ticket ID:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint._id.toString().slice(-8)}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Subject:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.name}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Category:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.category}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Department:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${departmentName}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Status:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${complaint.status}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Date:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatDate(complaint.date)}</td>
            </tr>
          </table>
          
          <p>We will notify you of any updates to your complaint.</p>
          <p>Thank you for using our Citizen Engagement System.</p>
          <hr>
          <p style="color: #777; font-size: 12px; text-align: center;">
            You are receiving this email because you submitted a complaint with our system.<br>
            If you wish to unsubscribe from these notifications, please update your preferences in your account settings.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Complaint confirmation email failed:", error);
    return { success: false, error };
  }
};

// Send complaint status update email
exports.sendComplaintUpdate = async (complaint, statusUpdate, department) => {
  try {
    // Get user details
    const user = await User.findById(complaint.userId);
    
    // Check if user wants to receive notifications
    if (!user || !user.emailNotifications) {
      return { success: false, message: "User has disabled notifications" };
    }
    
    const departmentName = department ? department.name : 'Unassigned';
    
    const mailOptions = {
      from: '"Citizen Engagement System" <willynorbert53@gmail.com>',
      to: user.email,
      subject: `Complaint Status Updated - Ticket #${complaint._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Complaint Status Update</h2>
          <p>Dear ${user.name},</p>
          <p>Your complaint with ticket number #${complaint._id.toString().slice(-8)} has been updated:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">New Status:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #4a6ee0;"><strong>${statusUpdate.status}</strong></td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Department:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${departmentName}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Update Time:</th>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatDate(statusUpdate.timestamp)}</td>
            </tr>
          </table>
          
          ${statusUpdate.message ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4a6ee0; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p>${statusUpdate.message}</p>
          </div>
          ` : ''}
          
          <p>You can track the progress of your complaint by logging into your account.</p>
          <p>Thank you for using our Citizen Engagement System.</p>
          <hr>
          <p style="color: #777; font-size: 12px; text-align: center;">
            You are receiving this email because you submitted a complaint with our system.<br>
            If you wish to unsubscribe from these notifications, please update your preferences in your account settings.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Complaint update email failed:", error);
    return { success: false, error };
  }
};

// Send comment notification email
exports.sendCommentNotification = async (complaint, comment, department) => {
  try {
    // Get user details
    const user = await User.findById(complaint.userId);
    
    // Check if user wants to receive notifications
    if (!user || !user.emailNotifications) {
      return { success: false, message: "User has disabled notifications" };
    }
    
    const departmentName = department ? department.name : 'Unassigned';
    
    const mailOptions = {
      from: '"Citizen Engagement System" <willynorbert53@gmail.com>',
      to: user.email,
      subject: `New Response on Your Complaint - Ticket #${complaint._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">New Response Received</h2>
          <p>Dear ${user.name},</p>
          <p>A new response has been added to your complaint with ticket number #${complaint._id.toString().slice(-8)}:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4a6ee0; margin: 15px 0;">
            <p>${comment.text}</p>
            <p style="margin-bottom: 0; color: #777; font-style: italic;">
              - ${departmentName} (${formatDate(comment.timestamp)})
            </p>
          </div>
          
          <p>Current Status: <strong>${complaint.status}</strong></p>
          <p>You can log in to your account to view the complete thread and respond if needed.</p>
          <p>Thank you for using our Citizen Engagement System.</p>
          <hr>
          <p style="color: #777; font-size: 12px; text-align: center;">
            You are receiving this email because you submitted a complaint with our system.<br>
            If you wish to unsubscribe from these notifications, please update your preferences in your account settings.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Comment notification email failed:", error);
    return { success: false, error };
  }
};
