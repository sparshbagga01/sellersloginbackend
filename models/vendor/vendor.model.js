import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    // Basic Info
    registrar_name: { type: String }, // added
    name: { type: String },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true },
    business_type: { type: String },
    gst_number: { type: String, unique: true, sparse: true },
    pan_number: { type: String, unique: true, sparse: true },

    // Alternate Contact
    alternate_contact_name: { type: String },
    alternate_contact_phone: { type: String },

    // Address Info
    address: { type: String }, // combined address_line_1 + address_line_2
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" },

    // Bank Details
    bank_name: { type: String },
    bank_account: { type: String },
    ifsc_code: { type: String },
    branch: { type: String },
    upi_id: { type: String },

    // Business Details
    established_year: { type: String },
    business_nature: { type: String },
    annual_turnover: { type: String },
    dealing_area: { type: String },
    office_employees: { type: String },

    // Other Info
    categories: { type: [String] }, // store as array instead of comma-separated
    return_policy: { type: String },
    operating_hours: { type: String },

    // Documents
    gst_cert: { type: String }, // file path or URL
    pan_card: { type: String }, // file path or URL
    certificates: [
      {
        name: String,
        file: String,
        issuedBy: String,
        issuedDate: Date,
      },
    ],

    // Authentication
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
