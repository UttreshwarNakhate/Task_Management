import express from "express";
import { login, refreshToken, register, getUserProfile, logout } from "../controller/authController";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskById,
} from "../controller/TaskController";

// Create an instance of Express Router
const router = express.Router();

// This route is used to register the user
router.post("/register", register);
router.post("/login", login);
router.post('/logout', authMiddleware, logout)
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, getUserProfile);


// This route are used to management of tasks
router.post("/createTask", authMiddleware, createTask);
router.get("/getTasks", authMiddleware, getTasks);
router.get("/getTaskById/:id", authMiddleware, getTaskById);
router.put("/updateTask/:id", authMiddleware, updateTask);
router.delete("/deleteTask/:id", authMiddleware, deleteTask);

// Export the router for use in other parts of the application
export default router;
