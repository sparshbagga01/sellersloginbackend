import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
  message: { status: 429, message: "Cannot hold that much load :(" },
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.1.20:5173",
  "https://ophmate-admin.vercel.app",
  "https://vendor-template.vercel.app",
  "https://ophmate-frontend.vercel.app",
  "https://ophmate-frontend-579008086831.us-central1.run.app",
  "https://sellerslogin.com/",
  "https://www.sellerslogin.com"
];

// CORS
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

// Handle CORS errors
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ message: "Origin not allowed by CORS policy" });
  }
  next(err);
});

app.use(limiter);
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Helloww, Pankaj said hi :)");
});

app.use("/api", router);

export default app;
