import fs from "fs";
import path from "path";
import { Banner } from "../../models/banner.model.js";

// ✅ Create Banner
export const createBanner = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = `/uploads/banners/${file.filename}`;

    const banner = new Banner({
      title,
      description,
      imageUrl,
    });

    await banner.save();

    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating banner" });
  }
};

// 📜 Get All Banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching banners" });
  }
};

// 🔍 Get Single Banner
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.json(banner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching banner" });
  }
};

// ✏️ Update Banner
export const updateBanner = async (req, res) => {
  try {
    const { title, description, isActive } = req.body;
    const file = req.file;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let imageUrl = banner.imageUrl;

    if (file) {
      // Delete old image
      const oldPath = path.join(process.cwd(), banner.imageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/banners/${file.filename}`;
    }

    // Update fields
    if (title !== undefined) banner.title = title;
    if (description !== undefined) banner.description = description;
    banner.imageUrl = imageUrl;

    // Handle isActive: accept string "true"/"false" or boolean
    if (isActive !== undefined) {
      banner.isActive = isActive === true || isActive === "true";
    }

    await banner.save();
    res.json({ message: "Banner updated", banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating banner" });
  }
};


export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Delete local image file
    const imagePath = path.join(process.cwd(), banner.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting banner" });
  }
};