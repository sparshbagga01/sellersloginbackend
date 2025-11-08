import nodemailer from "nodemailer";
import { EMAIL, EMAIL_PASSWORD } from "../../config/variables.js";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

export const sendMail = async (to, subject, text) => {
  console.log("📧 sendMail called with parameters:", { to, subject, text });

  try {
    if (!to || !subject || !text) {
      console.error("❌ Missing required parameters:", { to, subject, text });
      throw new Error("Missing required email parameters");
    }

    console.log("🚀 Preparing to send email using transporter...");
    const info = await transporter.sendMail({
      from: EMAIL,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent successfully!");
    console.log("📤 Message ID:", info.messageId);
    console.log("📥 Preview URL (if using ethereal):", info.previewURL || "N/A");
    console.debug("📄 Full response from transporter:", info);

    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    console.debug("🪲 Full error object:", error);
    throw error;
  }
};

export default transporter;
