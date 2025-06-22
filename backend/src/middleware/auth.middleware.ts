import { Request, Response, NextFunction } from "express";
import customErrorHandler from "../Services/CustomErrorHandlerService";
import { TokenService } from "../Services/TokenService";
import logger from "../utils/logger";

// Extend Request to hold userId
export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Check for the Authorization header
  const authHeader = req.headers.authorization;
  logger.info("Authorization Header:", authHeader);
  // If the Authorization header is missing or does not start with "Bearer ", return 401 Unauthorized
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    next(customErrorHandler.unAuthorized("Access token is missing"));
    return;
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the TokenService
    const decoded = TokenService.verifyAccessToken(token) as {
      ip: string | undefined;
      userId: string;
    };

    logger.info("Decoded Token:", decoded);
    // Check IP 
    const requestIp = req.ip;
    if (decoded.ip !== requestIp) {
      return res.status(403).json("Token does not match this device");
    }

    // Add userId to request object
    req.userId = decoded.userId;
    logger.info("User ID from token in moddleware:", req.userId);
    next();
  } catch (err) {
    logger.error("Invalid or expired token");
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
