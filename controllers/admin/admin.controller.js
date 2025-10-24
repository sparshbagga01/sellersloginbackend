import { comparePassword } from "../../functions/common/index.js";
import { User } from "../../models/user/user.model.js"; // Mongoose model
import { Vendor } from "../../models/vendor/vendor.model.js"; // Mongoose model
import { encodeToken } from "../../services/jwt/index.js";

// 🔐 Login Admin or Vendor
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check User collection first
    let user = await User.findOne({ email });
    let isVendor = false;

    // If not found in User, check Vendor
    if (!user) {
      const vendor = await Vendor.findOne({ email });
      if (!vendor) {
        return res.status(404).json({ message: "No admin or vendor found with this email" });
      }
      user = vendor;
      isVendor = true;
    }

    // Verify role (only admin or vendor allowed)
    if (!isVendor && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admin or vendor can login." });
    }

    console.log("User found:", user);
    // Check if user is verified
    if (!user.is_verified) {
        console.log("User not verified:", user.is_verified);
      return res.status(403).json({ message: "Account not verified. Please verify your account first." });
    }

    // Validate password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = await encodeToken({
      user_id: user._id.toString(),
      role: isVendor ? "vendor" : user.role,
    });

    // Respond success
    res.status(200).json({
      success: true,
      message: `${isVendor ? "Vendor" : "Admin"} login successful`,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isVendor ? "vendor" : user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



// 👤 Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const admin = await User.findOne(
      { _id: adminId, role: "admin" },
      { password: 0 } // Exclude password
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// 📦 Get All Vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All vendors fetched successfully",
      total: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("💥 getAllVendors error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Verified Vendors
export const getVerifiedVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ is_verified: true }).sort({ updatedAt: -1 });

    res.status(200).json({
      message: "Verified vendors fetched successfully",
      total: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("💥 getVerifiedVendors error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🚫 Get Unverified Vendors
export const getUnverifiedVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ is_verified: false }).sort({ updatedAt: -1 });

    res.status(200).json({
      message: "Unverified vendors fetched successfully",
      total: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("💥 getUnverifiedVendors error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log("Verifying vendor with ID:", vendorId);
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { is_verified: true, is_active: true },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor verified successfully",
      vendor,
    });
  } catch (error) {
    console.error("💥 verifyVendor error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔴 Reject / Deactivate Vendor
export const rejectVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { is_verified: false, is_active: false },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor rejected / deactivated successfully",
      vendor,
    });
  } catch (error) {
    console.error("💥 rejectVendor error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🗑️ Delete Vendor
export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndDelete(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor deleted successfully",
      vendorId,
    });
  } catch (error) {
    console.error("💥 deleteVendor error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🕵️‍♂️ Get Vendor Details by ID
export const getVendorDetailsById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor details fetched successfully",
      vendor,
    });
  } catch (error) {
    console.error("💥 getVendorDetailsById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};