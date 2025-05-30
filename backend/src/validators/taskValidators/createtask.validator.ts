import Joi from "joi";

// Schema for task creation
const taskCreateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().required(),
});

// Function to validate the payload
const validate = (payload: object) => {
  const result = taskCreateSchema.validate(payload, { abortEarly: false }); // Show all errors
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

export const createTaskValidator = { validate };
