import { Task } from "../model/tasks.model";
import { AuthRequest } from "../middleware/auth.middleware";
import httpResponse from "../utils/httpResponse";
import {
  PAYLOAD_VALIDATION_FAILED,
  TASK_CREATED,
  TASK_FETCHED,
  TASK_UPDATED,
  TASK_DELETED,
} from "../constants/messages_constant";
import { asyncHandler } from "../utils/asyncHandler";
import customErrorHandler from "../Services/CustomErrorHandlerService";
import { createTaskValidator } from "../validators/taskValidators/createtask.validator";
import { getTaskValidator } from "../validators/taskValidators/getTasks.validator";

/**
 * Create a new task
 * - User must be authenticated
 * - Saves task with userId and createdBy
 */
export const createTask = asyncHandler(async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId; // Get user ID from middleware

    // Validate task input using Joi or any schema validator
    const validationError = createTaskValidator.validate(req.body);

    if (validationError) {
      // If validation fails, send a 400 error
      return next(
        customErrorHandler.validationFailed(PAYLOAD_VALIDATION_FAILED)
      );
    }

    // Destructure fields from request body
    const { title, description, status } = req.body;

    // Create a new task document
    const newTask = new Task({
      title,
      description,
      status,
      userId: userId,
      createdBy: userId,
      updatedBy: userId,
    });

    // Save the task in MongoDB
    const task = await newTask.save();

    // Return success response
    httpResponse(req, res, 201, TASK_CREATED, task);
  } catch (err) {
    console.error("Error creating task:", err);
    next(customErrorHandler.serverError("Error creating task"));
  }
});

/**
 * Get all tasks for a user with optional filtering and pagination
 * - Filter by status (optional): ?status=Todo or ?status=InProgress or ?status=Completed
 * - Pagination (optional): ?page=1&limit=10
 */
export const getTasks = asyncHandler(async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId;


       // Validate task input using Joi or any schema validator
    const validationError = getTaskValidator.validate(req.body);

    if (validationError) {
      // If validation fails, send a 400 error
      return next(
        customErrorHandler.validationFailed(PAYLOAD_VALIDATION_FAILED)
      );
    }

    // Get query params
    const { status, page = "1", limit = "10" } = req.query;

    // Build filter object
    const filter: any = { userId };
   
    // If status is provided, add to filter
    if (status && typeof status === "string") {
      filter.status = status;
    }

    // Convert to numbers
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination info
    const totalTasks = await Task.countDocuments(filter);

    // Find tasks with filter + pagination
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limitNumber);

    // Create response object with pagination info
    const getTasks = {
      tasks,
      total: totalTasks,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalTasks / limitNumber),
    };

    httpResponse(req, res, 200, TASK_FETCHED, getTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    next(customErrorHandler.serverError("Error fetching tasks"));
  }
});

/**
 * Get a specific task by ID
 * - Only if it belongs to the logged-in user
 */
export const getTaskById = asyncHandler(async (req: AuthRequest, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return next(customErrorHandler.notFound("Task not found"));
    }

    httpResponse(req, res, 200, TASK_FETCHED, task);
  } catch (err) {
    console.error("Error fetching task:", err);
    next(customErrorHandler.serverError("Error fetching task"));
  }
});

/**
 * Update task by ID
 * - Only if it belongs to the user
 */
export const updateTask = asyncHandler(async (req: AuthRequest, res, next) => {
  try {
    console.log("Request Body for Update Task:", req.body);

    // Update task and return new version using { new: true }
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // Match task by id and user
      { ...req.body, updatedBy: req.userId }, // Apply updates
      { new: true } // Return updated doc
    );

    console.log("Updated Task:", updatedTask);

    if (!updatedTask) {
      next(customErrorHandler.notFound("Task not found"));
      return;
    }

    httpResponse(req, res, 200, TASK_UPDATED, updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    next(customErrorHandler.serverError("Error updating task"));
  }
});

/**
 * Delete a task by ID
 * - Only if it belongs to the user
 */
export const deleteTask = asyncHandler(async (req: AuthRequest, res, next) => {
  try {
    console.log("Request Params for Delete Task:", req.params);
    // Find and delete task where id and user match
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    console.log("Deleted Task:", deleted);

    if (!deleted) {
      next(customErrorHandler.notFound("Task not found"));
      return;
    }

    httpResponse(req, res, 200, TASK_DELETED, deleted);
  } catch (err) {
    console.error("Error deleting task:", err);
    next(customErrorHandler.serverError("Error deleting task"));
  }
});
