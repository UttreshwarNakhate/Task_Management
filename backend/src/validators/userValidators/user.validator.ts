import Joi from "joi";

// Schema for user creation
const userCreateSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).trim(),
  email: Joi.string().email(),
  password: Joi.string().required(),
  createdBy: Joi.string(),
  updatedBy: Joi.string(),
});

// Function to validate the payload
const validate = (payload: object) => {
  const result = userCreateSchema.validate(payload, { abortEarly: false }); 
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

export const userValidator = { validate };
