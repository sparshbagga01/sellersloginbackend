import { User } from "../../models/user/user.model.js";
import { hashedPassword } from "../common/index.js";

export const createAdminUser = async () => {
  try {
    const adminEmail = "pankaj@oph.com";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Hash the password
    const hashPassword = await hashedPassword("pankajverma");

    // Create admin user
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      phone: "9999999999",
      password: hashPassword,
      role: "admin",
      is_active: true,
      city: "Mumbai",
      is_verified: true,
      state: "Maharashtra",
      country: "India",
    });

    console.log("🎉 Default admin user created successfully!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
};

export const generateOtp = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};
