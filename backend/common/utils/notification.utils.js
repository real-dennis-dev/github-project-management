const nodemailer = require("nodemailer");

class NotificationUtils {
  constructor() {
    this.transporter = null;
    this.setupEmailTransport();
  }

  setupEmailTransport() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  // Sends email
  async sendEmail(to, subject, body, options = {}) {
    try {
      if (!this.transporter) {
        console.warn("Email transport not configured");
        return { success: false, error: "Email service not configured" };
      }

      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || "noreply@example.com",
        to,
        subject,
        html: body,
        ...options,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Sends webhook
  async sendWebhook(url, data, options = {}) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      const responseData = await response.text();
      return {
        success: response.ok,
        statusCode: response.status,
        data: responseData,
      };
    } catch (error) {
      console.error("Webhook send error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Creates notification
  createNotification(user, message, type = "info", data = null) {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id || user,
      message,
      type,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Sends notification to user
  async sendNotification(user, message, type = "info", data = null) {
    // Store in database
    const notification = this.createNotification(user, message, type, data);

    // Push to realtime if available
    // This would integrate with your realtime service

    // Send email notification if needed
    if (user.email && user.emailNotifications) {
      await this.sendEmail(
        user.email,
        `Notification: ${message}`,
        `<p>${message}</p>`
      );
    }

    return notification;
  }
}

const notificationUtils = new NotificationUtils();

module.exports = notificationUtils;
module.exports.notificationUtils = notificationUtils;
