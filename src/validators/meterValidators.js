const Joi = require('joi');

exports.createSchema = Joi.object({
  locationId: Joi.number().integer().required(),
  name: Joi.string().required(),
  unitId: Joi.number().integer().required(),
  type: Joi.string().valid('manual', 'auto').default('manual'),
  description: Joi.string().allow('')
});

exports.updateSchema = Joi.object({
  locationId: Joi.number().integer(),
  name: Joi.string(),
  unitId: Joi.number().integer(),
  type: Joi.string().valid('manual', 'auto'),
  description: Joi.string().allow('')
}).min(1);
