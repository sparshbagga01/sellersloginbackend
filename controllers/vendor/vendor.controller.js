import path from "path";
import { Vendor } from "../../models/vendor/vendor.model.js";
import { generateOtp, hashedPassword } from "../../functions/common/index.js";
import { encodeToken } from "../../services/jwt/index.js";
import { sendMail } from "../../services/mail/index.js";


const otpStore = new Map();
const emailOtpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000;


export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    const otp = generateOtp();
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY });

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP required" });

    const record = otpStore.get(phone);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    otpStore.delete(phone);

    let vendor = await Vendor.findOne({ phone });
    if (!vendor) {
      vendor = await Vendor.create({ phone });
    }

    const token = encodeToken({ id: vendor._id, role: vendor.role });
    res.status(200).json({ message: "Phone verified successfully", token });
  } catch (error) {
    console.error("verifyPhoneOtp error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};


export const sendEmailOtp = async (req, res) => {
  try {
    const { id } = req.user;
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Vendor.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if(user.is_profile_completed){
      return res.status(400).json({ message: "Profile already completed" });
    }

    const otp = generateOtp();
    emailOtpStore.set(email, { otp, expiresAt: Date.now() + OTP_EXPIRY });

    await sendMail(
      email,
      "Your email verification code",
      `Your OTP is: ${otp}`
    );

    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("sendEmailOtp error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await Vendor.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });



    const record = emailOtpStore.get(email);
    if (!record)
      return res.status(400).json({ message: "No OTP found, please resend" });
    if (Date.now() > record.expiresAt) {
      emailOtpStore.delete(email);
      return res
        .status(400)
        .json({ message: "OTP expired, please request a new one" });
    }
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.is_email_verified = true;
    user.email = email;
    await user.save();
    emailOtpStore.delete(email);

    return res
      .status(200)
      .json({ message: "Email verified successfully", user });
  } catch (error) {
    console.error("verifyEmailOtp error:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};

export const updatePersonalDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, password } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    if (password && password.trim() !== "") {
      vendor.password = await hashedPassword(password);
    }

    if (email) vendor.email = email;

    await vendor.save();
    res.status(200).json({ message: "Personal details updated", vendor });
  } catch (error) {
    console.error("updatePersonalDetails error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateBusinessDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const {
      name,
      gst_number,
      business_type,
      bank_name,
      bank_account,
      ifsc_code,
      pan_number,
      branch,
      upi_id,
      categories,
      return_policy,
      operating_hours,
      address,
      street,
      city,
      state,
      pincode,
      alternate_contact_name,
      alternate_contact_phone,
    } = req.body;

    const gst_cert_path = req.files?.gst_cert
      ? `/uploads/vendor/${path.basename(req.files.gst_cert[0].path)}`
      : vendor.gst_cert;

    const pan_card_path = req.files?.pan_card
      ? `/uploads/vendor/${path.basename(req.files.pan_card[0].path)}`
      : vendor.pan_card;

      const haspassword = hashedPassword("pankajverma!");
    // Update vendor
    Object.assign(vendor, {
      name,
      gst_number,
      business_type,
      bank_name,
      bank_account,
      ifsc_code,
      pan_number,
      branch,
      upi_id,
      categories,
      return_policy,
      operating_hours,
      address,
      street,
      city,
      state,
      pincode,
      password:haspassword,
      alternate_contact_name,
      alternate_contact_phone,
      gst_cert: gst_cert_path,
      pan_card: pan_card_path,
      is_profile_completed: true,
      profile_complete_level: 100,
    });

    await vendor.save();

    res.status(200).json({ message: "Business details updated", vendor });
  } catch (error) {
    console.error("updateBusinessDetails error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getVendorProfile = async (req, res) => {
  try {
    const id = req.user.id; // extracted from JWT middleware
    const vendor = await Vendor.findById(id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res
      .status(200)
      .json({
        success: true,
        message: "Vendor profile fetched successfully",
        vendor,
      });
  } catch (error) {
    console.error("getVendorProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
