// This file is responsible for connecting to the MongoDB database using Mongoose.
// It exports a function that establishes the connection and logs the status.
import mongoose from "mongoose";
import { DB_NAME } from "../constants/db.constant";
import config from "./config";
import logger from "../utils/logger";

// Extracting the database URL from the configuration
const DB_URL = config.DB_URL;

// Function to connect to the MongoDB database
// This function uses Mongoose to connect to the MongoDB database specified in the configuration.
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${DB_URL}/${DB_NAME}`);
    logger.info(
      `\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    logger.error("MONGODB connection error", error);
    process.exit(1);
  }
};

// Exporting the connectDB function to be used in other parts of the application
export default connectDB;
