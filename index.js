import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import ImageKit from "imagekit";
import {
  IMAGEKIT_IO_PRIVATE_KEY,
  IMAGEKIT_IO_PUBLIC_KEY,
  IMAGEKIT_IO_URL,
} from "./config/variables.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    status: 429,
    message: "Cannot hold that much load :(",
  },
});

export const imagekit = new ImageKit({
  publicKey: IMAGEKIT_IO_PUBLIC_KEY,
  privateKey: IMAGEKIT_IO_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_IO_URL,
});

//this is upload structure of imagekit io 

// const uploadResponse = await imagekit.upload({
//   file: imageBase64,   // required: Base64 string, URL, or file buffer
//   fileName: fileName,  // optional but recommended
//   folder: "/products", // optional: upload folder in ImageKit
//   tags: ["product"],   // optional
// });

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-production-domain.com",
  "http://localhost:8000",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Hello, Pankaj said hi :)");
});

app.use("/api", router);

export default app;
