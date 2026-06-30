import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[a-z]/, "lowercase letter")
    .pattern(/[0-9]/, "number")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must not exceed 128 characters",
      "string.pattern.name": "Password must contain a {#name}",
      "any.required": "Password is required",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  return next();
};
