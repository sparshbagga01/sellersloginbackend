import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String },
    business_type: { type: String },
    gst_number: { type: String, unique: true, sparse: true },
    pan_number: { type: String, unique: true, sparse: true },

    // Alternate Contact
    alternate_contact_name: { type: String },
    alternate_contact_phone: { type: String },

    // Address
    address: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },

    // Bank Details
    bank_name: { type: String },
    bank_account: { type: String },
    ifsc_code: { type: String },
    branch: { type: String },
    upi_id: { type: String },

    // Other Info
    categories: { type: [String] }, // store as array instead of comma-separated
    return_policy: { type: String },
    operating_hours: { type: String },

    // Documents
    gst_cert: { type: String }, // file path or URL
    pan_card: { type: String }, // file path or URL
    certificates: [
      {
        name: String, // e.g. "certificate1"
        file: String, // URL or path
        issuedBy: String, // optional
        issuedDate: Date, // optional
      },
    ],

    // Authentication
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true },
    password: { type: String },

    // Role & Status
    role: { type: String, default: "vendor" },
    is_email_verified: { type: Boolean, default: false },
    is_profile_completed: { type: Boolean, default: false },
    profile_complete_level: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
