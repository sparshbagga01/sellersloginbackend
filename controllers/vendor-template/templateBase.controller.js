/* =======================================================
   MAIN TEMPLATE CONTROLLERS
======================================================= */

import { TemplateBase } from "../../models/vendor-template/templatebase.model.js";

// Create a new Template
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
