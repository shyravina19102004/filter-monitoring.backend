const Joi = require('joi');

const createLocationSchema = Joi.object({
  name: Joi.string().required(),
  locationTypeId: Joi.number().integer().required(),
  parentId: Joi.number().integer().allow(null),
  description: Joi.string().allow(''),
  externalId: Joi.string().allow('')
});

const updateLocationSchema = Joi.object({
  name: Joi.string(),
  locationTypeId: Joi.number().integer(),
  parentId: Joi.number().integer().allow(null),
  description: Joi.string().allow(''),
  externalId: Joi.string().allow('')
}).min(1);

module.exports = { createLocationSchema, updateLocationSchema };