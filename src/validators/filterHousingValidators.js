const Joi = require('joi');

exports.createSchema = Joi.object({
  locationId: Joi.number().integer().required(),
  name: Joi.string().required(),
  description: Joi.string().allow('')
});

exports.updateSchema = Joi.object({
  locationId: Joi.number().integer(),
  name: Joi.string(),
  description: Joi.string().allow('')
}).min(1);
