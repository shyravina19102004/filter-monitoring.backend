const Joi = require('joi');

const createRoleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('')
});

const updateRoleSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('')
}).min(1);

module.exports = { createRoleSchema, updateRoleSchema };