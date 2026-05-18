import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import loggerMiddleware from "./middlewares/logger.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const app = express();

// Routes
import registrationRoutes from "./Routes/Registration.route.js";
import AiModles from "./Routes/AIModle.route.js";
import RepoSystem from "./Routes/RepoSystem.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port
const port = process.env.PORT || 3500;
const isProduction = process.env.NODE_ENV === "production";

// CORS configuration
console.log("Allowed Origins:", process.env.FRONTEND_URLS);

const allowedOrigins = isProduction
  ? (process.env.FRONTEND_URLS || "").split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

const corsOptions = {
  origin: function (origin, callback) {
    // allow REST tools like Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// Middleware
app.use(loggerMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use(registrationRoutes);
app.use(AiModles);
app.use(RepoSystem);

app.listen(port, () => console.log(`Your Server running on this port ${port}`));
