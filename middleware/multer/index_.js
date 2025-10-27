import multer from "multer";
import path from "path";
import fs from "fs";

const defaultImagePath = path.join(process.cwd(), "uploads/products/default");
const variantImagePath = path.join(process.cwd(), "uploads/products/variants");

[defaultImagePath, variantImagePath].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "globalImages") cb(null, defaultImagePath);
    else cb(null, variantImagePath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const uploadVariantsAndGlobal = (variantCount = 10) => {
  const fields = [
    { name: "globalImages", maxCount: 5 },
    ...Array.from({ length: variantCount }, (_, i) => ({ name: `images-${i}`, maxCount: 5 }))
  ];
  return multer({ storage }).fields(fields);
};
