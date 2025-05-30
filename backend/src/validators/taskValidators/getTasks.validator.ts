import Joi from "joi";

// Schema for task creation
const taskGetSchema = Joi.object({
  status: Joi.string().optional(),
  page: Joi.string().optional(),
  limit: Joi.string().optional(),
});

// Function to validate the payload
const validate = (payload: object) => {
  const result = taskGetSchema.validate(payload, { abortEarly: false }); // Show all errors
  if (result.error) {
    return {
      status: 400,
      error: result, // clean errors
      data: null,
      serverTime: new Date().getTime(),
    };
  }
  return null; // No error
};

export const getTaskValidator = { validate };
