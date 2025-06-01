import express from "express";
import cors from "cors";
import config from "./config/config";
import router from "./routes/routes";
import { globalErrorHandler } from "./middleware/global.errorHnadler";

// Create an Express application instance
const app = express();

// Middlewares
app.use(express.json());

// Client URL from configuration
const CLIENT_URL = config.CLIENT_URL;

// CORS configuration
const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
// Enable CORS with the specified options
app.use(cors(corsOptions));

//  Set up the base route for the API
app.use("/api", router);

// Global error handler
app.use(globalErrorHandler)

export default app;
