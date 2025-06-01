import { sign, verify  } from "jsonwebtoken";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { RefreshToken } from "../model/refreshToken.model";

// Get secrets from environment variables or fallback to default
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export class TokenService {
  /**
   * Generate Access Token
   * - Valid for 1 day
   * - Uses HS256 algorithm
   * - Used for normal API access
   */
  static generateAccessToken(payload: object) {
    if (!ACCESS_TOKEN_SECRET) {
      throw createHttpError(500, "Access token secret is not defined");
    }

    return sign(payload, ACCESS_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h", 
      issuer: "task-manager-service",
    });
  }

  /**
   * Generate Refresh Token
   * - Valid for 1 year
   * - Used to create new access tokens
   */
  static generateRefreshToken(payload: object) {
    if (!REFRESH_TOKEN_SECRET) {
      throw createHttpError(500, "Refresh token secret is not defined");
    }

    return sign(payload, REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1y", // 1 year
      issuer: "task-manager-service",
    });
  }

  /**
   * Save Refresh Token in database
   * - Stores token, user ID, and expiration date
   * - Linked to a user
   */
  static async saveRefreshToken(userId: mongoose.Types.ObjectId, token: string) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 year in ms
    const expiresAt = new Date(Date.now() + MS_IN_YEAR);

    const refreshToken = new RefreshToken({
      userId,
      token,
      expiresAt,
    });

    return await refreshToken.save();
  }

  /**
   * Delete a refresh token from DB
   * - Used on logout or token rotation
   */
  static async deleteRefreshToken(token: string) {
    return await RefreshToken.deleteOne({ token });
  }

  
  /**
   * Verify Access Token
   * - Returns decoded payload if token is valid
   * - Throws 401 error if invalid or expired
   */
  static verifyAccessToken(token: string) {
    if (!ACCESS_TOKEN_SECRET) {
      throw createHttpError(500, "Access token secret is not defined");
    }
    try {
      const payload = verify(token, ACCESS_TOKEN_SECRET);
      return payload;
    } catch (err) {
      throw createHttpError(401, "Invalid or expired access token");
    }
  }

  /**
   * Verify Refresh Token
   * - Returns decoded payload if valid
   * - Throws 401 error if invalid or expired
   * - Uses refresh token secret
   */
  static verifyRefreshToken(token: string) {
    if (!REFRESH_TOKEN_SECRET) {
      throw createHttpError(500, "Refresh token secret is not defined");
    }
    try {
      const payload = verify(token, REFRESH_TOKEN_SECRET);
      return payload;
    } catch (err) {
      throw createHttpError(401, "Invalid or expired refresh token");
    }
  }

  
}
