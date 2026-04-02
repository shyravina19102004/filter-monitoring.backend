const Joi = require('joi');

const createFilterModelSchema = Joi.object({
  name: Joi.string().required(),
  filterTypeId: Joi.number().integer().required(),
  manufacturerId: Joi.number().integer().required(),
  lifeTimeDays: Joi.number().integer().min(0).allow(null),
  lifeVolume: Joi.number().integer().min(0).allow(null),
  minStock: Joi.number().integer().min(0).default(0),
  description: Joi.string().allow('')
});

const updateFilterModelSchema = Joi.object({
  name: Joi.string(),
  filterTypeId: Joi.number().integer(),
  manufacturerId: Joi.number().integer(),
  lifeTimeDays: Joi.number().integer().min(0).allow(null),
  lifeVolume: Joi.number().integer().min(0).allow(null),
  minStock: Joi.number().integer().min(0),
  description: Joi.string().allow('')
}).min(1);

module.exports = { createFilterModelSchema, updateFilterModelSchema };