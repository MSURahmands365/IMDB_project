const joi = require("joi");

exports.signupSchema = joi.object({
  email: joi
    .string()
    .min(10)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: joi
    .string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});

exports.signinSchema = joi.object({
  email: joi
    .string()
    .min(10)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: joi
    .string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});

exports.changePasswordSchema = joi.object({
  oldPassword: joi
    .string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/), // same policy as signin
  newPassword: joi
    .string()
    .required()
    .disallow(joi.ref('oldPassword')) // prevent same password
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});

exports.deleteAccountSchema = joi.object({
  password: joi
    .string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});
