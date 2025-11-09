/* =======================================================
   MAIN TEMPLATE CONTROLLERS
======================================================= */

import { TemplateBase } from "../../models/vendor-template/templatebase.model.js";

// Create a new Template
// POST or PUT /api/templates/home
export const createOrUpdateHomePage = async (req, res) => {
  try {
    const { vendor_id, components } = req.body;

    // Find or create template for this vendor
    let template = await TemplateBase.findOne({ vendor_id });

    if (template) {
      // Update existing
      template.name = name;

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
    res.status(500).json({
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

export const createSampleTemplateForVendor = async (vendor) => {
  try {
    console.log("🚀 [createSampleTemplateForVendor] Function called");
    console.log("📦 Vendor Object Received:", vendor);

    if (!vendor?._id) {
      console.error("❌ Vendor object missing _id:", vendor);
      throw new Error("Vendor object must include an _id");
    }

    console.log("🔍 Checking for existing template in DB...");
    const existingTemplate = await TemplateBase.findOne({
      vendor_id: vendor._id,
    });

    if (existingTemplate) {
      console.log(
        `⚠️ Template already exists for vendor: ${vendor.name || vendor._id}`
      );
      return existingTemplate;
    }

    console.log(
      `🧩 Creating sample template for vendor: ${vendor.name || vendor._id}`
    );

    const sampleTemplate = new TemplateBase({
      vendor_id: vendor._id,
      business_name: vendor.registrar_name,
      components: {
        logo: "https://images.unsplash.com/photo-1620632523414-054c7bea12ac?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        home_page: {
          header_text: `Welcome to ${vendor.name || "Our Business"}!`,
          header_text_small: "Quality products and trusted services",
          backgroundImage: "https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
          button_header: "Explore Now",
          description: {
            large_text: `${
              vendor.name || "Our business"
            } offers top-notch services in ${
              vendor.business_type || "various domains"
            }.`,
            summary:
              "We are committed to customer satisfaction and excellence.",
            percent: {
              percent_in_number: "100%",
              percent_text: "Quality Guarantee",
            },
            sold: {
              sold_number: "10K+",
              sold_text: "Happy Clients",
            },
          },
        },
        about_page: {
          hero: {
            backgroundImage: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
            title: "About Us",
            subtitle: `Learn more about ${vendor.name || "our company"}`,
          },
          story: {
            paragraphs: [
              `${
                vendor.name || "Our company"
              } has been serving customers since ${
                vendor.established_year || "our inception"
              }.`,
              "We pride ourselves on delivering quality and innovation.",
            ],
            image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
          },
          values: [
            {
              icon: "⭐",
              title: "Integrity",
              description: "We maintain honesty in all our dealings.",
            },
            {
              icon: "🚀",
              title: "Innovation",
              description: "We constantly evolve to meet customer needs.",
            },
          ],
          team: [
            {
              name: "John Doe",
              role: "Founder",
              image: "https://plus.unsplash.com/premium_photo-1665990293319-fe271ebcb6f3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFib3V0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
            },
          ],
          stats: [
            { value: "10+", label: "Years Experience" },
            { value: "5K+", label: "Satisfied Clients" },
          ],
        },
        contact_page: {
          hero: {
            backgroundImage: "https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
            title: "Get in Touch",
            subtitle: "We’re here to help you anytime.",
          },
          section_2: {
            hero_title: "Visit Our Office",
            hero_subtitle: vendor.address || "123 Business Street, City",
            hero_title2: "Call Us",
            hero_subtitle2: vendor.phone || "+91-9999999999",
            lat: "28.6139",
            long: "77.2090",
          },
        },
        social_page: {
          facebook: "https://facebook.com/sample",
          instagram: "https://instagram.com/sample",
          whatsapp: "https://wa.me/9999999999",
          twitter: "https://twitter.com/sample",
          faqs: {
            heading: "Frequently Asked Questions",
            subheading: "Find quick answers below",
            faqs: [
              {
                question: "Do you offer nationwide shipping?",
                answer: "Yes, we deliver across India.",
              },
              {
                question: "How can I contact customer support?",
                answer:
                  "You can reach us via our Contact page or call us directly.",
              },
            ],
          },
        },
      },
    });

    console.log(
      "🧱 Template Object Prepared:",
      JSON.stringify(sampleTemplate, null, 2)
    );

    console.log("💾 Saving template to database...");
    try {
      const savedTemplate = await sampleTemplate.save();
      console.log(
        `✅ Sample template created successfully for vendor: ${vendor._id}`
      );
      console.log("🗂️ Saved Template Details:", savedTemplate);

      return savedTemplate;
    } catch (saveError) {
      console.error("🔥 Error saving template:", saveError);
      throw saveError;
    }
  } catch (error) {
    console.error("🔥 Error in createSampleTemplateForVendor:", error);
    throw error;
  }
};
