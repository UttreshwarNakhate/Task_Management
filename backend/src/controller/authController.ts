import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model";
import { TokenService } from "../Services/TokenService";
import { userValidator } from "../validators/userValidators/user.validator";
import { asyncHandler } from "../utils/asyncHandler";
import customErrorHandler from "../Services/CustomErrorHandlerService";
import {
  ACCESS_TOKEN_CREATED,
  PAYLOAD_VALIDATION_FAILED,
  REFRESH_TOKEN_NOT_FOUND,
  REFRESH_TOKEN_REQUIRED,
  SECRET_NOT_FOUND,
  USER_ALREADY_EXISTS,
  USER_CREATED,
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  USER_PROFILE_FETCHED,
} from "../constants/messages_constant";
import httpResponse from "../utils/httpResponse";
import { RefreshToken } from "../model/refreshToken.model";
import config from "../config/config";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../utils/logger";

// This function handles user Registration
// It checks if the user already exists, hashes the password, and saves the new user to the database
export const register = asyncHandler(async (req, res, next) => {
  try {
    // Validate request body using userValidator
    const validationError = userValidator.validate(req.body);

    // If validation fails, return 400 with error details
    if (validationError) {
      // If there is an error returned, log the error and pass it to next().
      logger.error("Validation error:", validationError);
      return next(
        customErrorHandler.validationFailed(PAYLOAD_VALIDATION_FAILED)
      );
    }

    // Destructure the request body to get user details
    const { username, email, password } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.info("User already exists:");
      return next(customErrorHandler.alreadyExist(USER_ALREADY_EXISTS));
    } else {
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user instance
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        createdBy: username,
        updatedBy: username,
      });

      // Save the new user to the database
      const user = await newUser.save();

      // return success response with data
      httpResponse(req, res, 201, USER_CREATED, user);
    }
  } catch (err) {
    next(customErrorHandler.serverError("Error registering user"));
  }
});

// This function handles user Login
// It checks if the user exists, compares the password, and generates a JWT token for the user
export const login = asyncHandler(async (req, res, next) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    logger.info("User found:", user);
    if (!user) {
      next(customErrorHandler.notFound("User not found"));
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(customErrorHandler.validationFailed("Invalid credentials"));
    }

    // Update login status and timestamp
    user.isLoggedIn = true;
    user.updatedAt = new Date();
    await user.save();

    // Generate access and refresh tokens
    const accessToken = TokenService.generateAccessToken({ userId: user._id, ip: req.ip });
    const refreshToken = TokenService.generateRefreshToken({
      userId: user._id,
      ip: req.ip
    });

    // Save refresh token to DB
    await TokenService.saveRefreshToken(user._id, refreshToken);

    // Send tokens and user info
    const response = {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
    httpResponse(req, res, 200, USER_LOGGED_IN, response);
  } catch (err) {
    logger.error("Login error:", err);
    next(customErrorHandler.serverError("Error logging in user"));
  }
});

// This function handles user logout
export const logout = asyncHandler(async (req: AuthRequest, res, next) => {
  try {
    // Check if userId is available in request
    const userId = req.userId;

    logger.info("User ID from request in the controller:", userId);

    // if userId is not provided, return an error
    if (!userId) {
      return next(customErrorHandler.unAuthorized("User id not found"));
    }

    // Update user status
    const user = await User.findById(userId);
    if (!user) {
      return next(customErrorHandler.notFound("User not found"));
    }

    // Set user as logged out and update timestamp
    user.isLoggedIn = false;
    user.updatedAt = new Date();
    await user.save();

    // Optionally: Delete refresh token
    await TokenService.deleteRefreshToken(userId);

    // Return success response
    httpResponse(req, res, 200, USER_LOGGED_OUT, null);
  } catch (error) {
    logger.error("Logout error:", error);
    next(customErrorHandler.serverError("Error logging out user"));
  }
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // logger.info("Refresh token received in controller:", refreshToken);
    // Check if refresh token is available
    if (!refreshToken) {
      next(customErrorHandler.tokenRetuired(REFRESH_TOKEN_REQUIRED));
      return;
    }

      // Decode the refresh token to get userId
    const decoded: any = TokenService.verifyRefreshToken(refreshToken);
    // logger.info("Decoded refresh token:", decoded);
    logger.info("Searching token in DB for userId:", decoded.userId);

    // Check if token exists in DB
    const savedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
    });
    logger.info("Saved token in DB:", {
      meta: {
        savedToken: savedToken,
      },
    });

    // If token is not found in DB, return error
    if (!savedToken) {
      next(customErrorHandler.notFound(REFRESH_TOKEN_NOT_FOUND));
      return;
    }

    // Generate new access token
    const newAccessToken = TokenService.generateAccessToken({
      userId: decoded.userId,
    });

    // Generate new refresh token (rotate refresh token)
    const newRefreshToken = TokenService.generateRefreshToken({
      userId: decoded.userId,
    });

    // Save new refresh token in DB
    const save = await TokenService.saveRefreshToken(
      decoded.userId,
      newRefreshToken
    );
    logger.info(`Saved ewn token in DB:, ${JSON.stringify(save)}`);
    // Delete old refresh token from DB
    const deleteNewToken = await TokenService.deleteRefreshToken(refreshToken);
    logger.info(`"Saved ewn token in DB:", ${JSON.stringify(deleteNewToken)}`);

    // Return both tokens to client
    httpResponse(req, res, 200, ACCESS_TOKEN_CREATED, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    next(
      customErrorHandler.validationFailed("Invalid or expired refresh token")
    );
  }
});

// This function retrieves the authenticated user's profile
export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId;

      // Find user by ID
      const user = await User.findById(userId).select("-password"); // exclude password

      if (!user) {
        return next(customErrorHandler.notFound("User not found"));
      }

      // Send user profile data
      httpResponse(req, res, 200, USER_PROFILE_FETCHED, user);
    } catch (err) {
      logger.error("Error fetching user profile:", err);
      next(customErrorHandler.serverError("Error fetching user profile"));
    }
  }
);
