const Joi = require('joi');

const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().required(),
  roleId: Joi.number().integer().required(),
  locationId: Joi.number().integer().allow(null),
  phone: Joi.string().allow(''),
  isActive: Joi.boolean().default(true)
});

const userUpdateSchema = Joi.object({
  email: Joi.string().email(),
  fullName: Joi.string(),
  roleId: Joi.number().integer(),
  locationId: Joi.number().integer().allow(null),
  phone: Joi.string().allow(''),
  isActive: Joi.boolean()
}).min(1); // хотя бы одно поле для обновления

module.exports = { userCreateSchema, userUpdateSchema };