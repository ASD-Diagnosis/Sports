const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || "Sports Ticketing"} <${
        process.env.EMAIL_USER
      }>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (user) => ({
    subject: "Welcome to Sports Ticketing!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Sports Ticketing, ${user.name}!</h2>
        <p>Thank you for joining our platform. You're now ready to discover and book tickets for amazing sports events.</p>
        <p>Start exploring upcoming events and enjoy the games!</p>
        <a href="${process.env.FRONTEND_URL}/events" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Browse Events</a>
      </div>
    `,
  }),

  ticketConfirmation: (ticket, event) => ({
    subject: `Ticket Confirmation - ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Ticket Confirmed!</h2>
        <p>Hi ${ticket.user.name},</p>
        <p>Your ticket for <strong>${
          event.title
        }</strong> has been confirmed.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Event Details:</h3>
          <p><strong>Date:</strong> ${new Date(
            event.date
          ).toLocaleDateString()}</p>
          <p><strong>Venue:</strong> ${event.venue.name}</p>
          <p><strong>Seat:</strong> ${ticket.seatInfo.category} - ${
      ticket.seatInfo.seatNumber
    }</p>
          <p><strong>Price:</strong> ₹${ticket.price}</p>
        </div>
        <p>Your QR code: <strong>${ticket.qrCode}</strong></p>
        <p>Please arrive at the venue 30 minutes before the event starts.</p>
      </div>
    `,
  }),

  gameReminder: (ticket, event, hoursUntil) => ({
    subject: `Reminder: ${event.title} starts in ${hoursUntil} hours`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Game Reminder</h2>
        <p>Hi ${ticket.user.name},</p>
        <p>This is a reminder that <strong>${
          event.title
        }</strong> starts in ${hoursUntil} hours.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Event Details:</h3>
          <p><strong>Date:</strong> ${new Date(
            event.date
          ).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(
            event.date
          ).toLocaleTimeString()}</p>
          <p><strong>Venue:</strong> ${event.venue.name}</p>
          <p><strong>Your Seat:</strong> ${ticket.seatInfo.category} - ${
      ticket.seatInfo.seatNumber
    }</p>
        </div>
        <p>Don't forget to bring your ticket QR code!</p>
      </div>
    `,
  }),

  seasonPassPurchase: (seasonPass, user) => ({
    subject: "Season Pass Purchase Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Season Pass Confirmed!</h2>
        <p>Hi ${user.name},</p>
        <p>Your season pass purchase has been confirmed.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Season Pass Details:</h3>
          <p><strong>Pass Name:</strong> ${seasonPass.name}</p>
          <p><strong>Sport:</strong> ${seasonPass.sport}</p>
          <p><strong>Valid From:</strong> ${new Date(
            seasonPass.validityPeriod.start
          ).toLocaleDateString()}</p>
          <p><strong>Valid Until:</strong> ${new Date(
            seasonPass.validityPeriod.end
          ).toLocaleDateString()}</p>
          <p><strong>Price:</strong> ₹${seasonPass.price}</p>
        </div>
        <p>You can now enjoy priority booking and discounted tickets for events!</p>
      </div>
    `,
  }),

  passwordReset: (resetToken) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>You requested a password reset for your Sports Ticketing account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
};
