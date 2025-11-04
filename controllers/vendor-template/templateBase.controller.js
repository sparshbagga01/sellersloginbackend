/* =======================================================
   MAIN TEMPLATE CONTROLLERS
======================================================= */

import { TemplateBase } from "../../models/vendor-template/templatebase.model.js";

// Create a new Template
// POST or PUT /api/templates/home
export const createOrUpdateHomePage = async (req, res) => {
  try {
    const { vendor_id, name, previewImage, components } = req.body;

    // Find or create template for this vendor
    let template = await TemplateBase.findOne({ vendor_id });

    if (template) {
      // Update existing
      template.name = name;
      template.previewImage = previewImage;
      template.components.home_page = components.home_page;
      await template.save();
    } else {
      // Create new
      template = new TemplateBase({
        vendor_id,
        name,
        previewImage,
        components: {
          home_page: components.home_page,
          logo: components.logo, // ✅ Don't forget logo!
        },
      });
      await template.save();
    }

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error("Error in createOrUpdateHomePage:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error saving template",
        error: error.message,
      });
  }
};

export const createOrUpdateAboutPage = async (req, res) => {
  try {
    const { vendor_id, components } = req.body;

    // Validate required fields from frontend
    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "vendor_id is required",
      });
    }

    if (!components) {
      return res.status(400).json({
        success: false,
        message: "About page components are required",
      });
    }

    // Find template by vendor_id instead of templateId
    let template = await TemplateBase.findOne({ vendor_id });

    if (template) {
      // Update existing template
      template.components.about_page = components;
      await template.save();
    } else {
      // Create new template if it doesn't exist
      template = await TemplateBase.create({
        vendor_id,
        name: `Template for vendor ${vendor_id}`,
        previewImage: "",
        components: {
          logo: "",
          home_page: {}, // You might want to initialize with defaults
          about_page: components,
          // Add other pages as needed
        },
      });
    }

    res.status(200).json({
      success: true,
      data: template.components.about_page,
      message: template.isNew
        ? "About page created successfully"
        : "About page updated successfully",
    });
  } catch (error) {
    console.error("Error in createOrUpdateAboutPage:", error);

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating about page",
      error: error.message,
    });
  }
};

export const createOrUpdateContactPage = async (req, res) => {
  try {
    const { vendor_id, components } = req.body;

    // Validate input
    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "vendor_id is required",
      });
    }

    if (!components) {
      return res.status(400).json({
        success: false,
        message: "Contact page components are required",
      });
    }

    // Find existing template by vendor_id
    let template = await TemplateBase.findOne({ vendor_id });

    if (template) {
      // Update contact page section
      template.components.contact_page = components;
      await template.save();
    } else {
      // Create a new template if none exists for this vendor
      template = await TemplateBase.create({
        vendor_id,
        name: `Template for vendor ${vendor_id}`,
        previewImage: "",
        components: {
          contact_page: components,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: template.components.contact_page,
      message: template.isNew
        ? "Contact page created successfully"
        : "Contact page updated successfully",
    });
  } catch (error) {
    console.error("Error in createOrUpdateContactPage:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Handle duplicate vendor_id (if unique index exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A template for this vendor already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating contact page",
      error: error.message,
    });
  }
};

export const createOrUpdateSocialLinksandFaqs = async (req, res) => {
  try {
    const { vendor_id, social_page } = req.body;

    // Validate input
    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "vendor_id is required",
      });
    }

    if (!social_page) {
      return res.status(400).json({
        success: false,
        message: "Social page data is required",
      });
    }

    // Find existing template by vendor_id
    let template = await TemplateBase.findOne({ vendor_id });

    if (template) {
      // Update social page section
      template.components.social_page = social_page;
      await template.save();
    } else {
      // Create a new template if none exists
      template = await TemplateBase.create({
        vendor_id,
        name: `Template for vendor ${vendor_id}`,
        previewImage: "",
        components: {
          social_page,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: template.components.social_page,
      message: template.isNew
        ? "Social links and FAQs created successfully"
        : "Social links and FAQs updated successfully",
    });
  } catch (error) {
    console.error("Error in createOrUpdateSocialLinksandFaqs:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Handle duplicate vendor_id (if unique index exists on vendor_id)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A template for this vendor already exists",
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: "Error updating social links and FAQs",
      error: error.message,
    });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const template = await TemplateBase.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error creating template", error });
  }
};

export const getalltemplatedata = async (req, res) => {
  try {
    const { vendor_id } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor id is required" });
    }

    const template = await TemplateBase.findOne({ vendor_id: vendor_id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const homepagedata = template;
    return res
      .status(200)
      .json({ message: "Data fetched successfully", data: homepagedata });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const gethomepage = async (req, res) => {
  try {
    const { vendor_id } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor id is required" });
    }

    const template = await TemplateBase.findOne({ vendor_id: vendor_id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const homepagedata = template.components.home_page;
    return res
      .status(200)
      .json({ message: "Data fetched successfully", data: homepagedata });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getcontactpage = async (req, res) => {
  try {
    const { vendor_id } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor id is required" });
    }

    const template = await TemplateBase.findOne({ vendor_id: vendor_id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const homepagedata = template.components.contact_page;
    return res
      .status(200)
      .json({ message: "Data fetched successfully", data: homepagedata });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getaboutpage = async (req, res) => {
  try {
    const { vendor_id } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor id is required" });
    }
    const template = await TemplateBase.findOne({ vendor_id: vendor_id });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const homepagedata = template.components.about_page;
    return res
      .status(200)
      .json({ message: "Data fetched successfully", data: homepagedata });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
