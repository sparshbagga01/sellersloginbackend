import multer from "multer";
import fs from "fs";
import path from "path";

// ---------- Utility to Ensure Folder Exists ----------
const makeDirIfNotExist = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ---------- Base Upload Paths ----------
const uploadPaths = {
  product: path.join(process.cwd(), "uploads", "products", "category"),
  category: path.join(process.cwd(), "uploads", "category"),
  vendor: path.join(process.cwd(), "uploads", "vendor"),
  csv: path.join(process.cwd(), "uploads", "csv"),
  subcategory: path.join(process.cwd(), "uploads", "subcategory"),
  productImages: path.join(process.cwd(), "uploads", "products", "images"),
  productVideos: path.join(process.cwd(), "uploads", "products", "videos"),
  banner: path.join(process.cwd(), "uploads", "banners"),
};

// Ensure all folders exist
Object.values(uploadPaths).forEach(makeDirIfNotExist);

// ---------- File Filters ----------
const imageVideoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video files are allowed"), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const csvFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === ".csv") cb(null, true);
  else cb(new Error("Only CSV files are allowed"), false);
};

const imageFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only .jpg, .jpeg, .png, .webp files are allowed"), false);
};

// ---------- Unique Filename Generator ----------
const uniqueName = (file) => {
  const ext = path.extname(file.originalname);
  return `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

// ---------- Storages ----------
const storages = {
  product: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.product),
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  }),

  category: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.category),
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  }),

  vendor: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.vendor),
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  }),

  csv: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.csv),
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  }),

  subcategory: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.subcategory),
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  }),

  productMedia: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = file.mimetype.startsWith("image/")
        ? uploadPaths.productImages
        : uploadPaths.productVideos;
      makeDirIfNotExist(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  }),

  banner: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.banner),
    filename: (req, file, cb) => {
      const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
      cb(null, name);
    },
  }),
};

// ---------- Exported Uploaders ----------
export const uploadVendorPDF = multer({
  storage: storages.vendor,
  fileFilter: pdfFilter,
});

export const uploadProductMedia = multer({
  storage: storages.product,
  fileFilter: imageVideoFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadCategoryImage = multer({
  storage: storages.category,
  fileFilter: imageFilter,
});

export const uploadCSV = multer({
  storage: storages.csv,
  fileFilter: csvFilter,
});

export const uploadSubCategoryImage = multer({
  storage: storages.subcategory,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProduct = multer({
  storage: storages.productMedia,
  fileFilter: imageVideoFilter,
});

export const uploadBanner = multer({
  storage: storages.banner,
  fileFilter: imageFilter,
});

export const uploadMultipleProducts = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPaths.productImages),
    filename: (req, file, cb) =>
      cb(null, `prod-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("files", 20);

// ---------- Generic Upload Controller ----------
export const handleUpload = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const urls = req.files.map((f) => `/uploads/products/images/${f.filename}`);
  res.status(200).json({ urls });
};

console.log("✅ Multer setup initialized successfully");
