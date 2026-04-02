const Joi = require('joi');

exports.createSchema = Joi.object({
  filterModelId: Joi.number().integer().required(),
  parameter: Joi.string().valid('time', 'volume').required(),
  threshold: Joi.number().positive().required(),
  unit: Joi.string().valid('days', 'liters', 'hours').required(),
  action: Joi.string().valid('warning', 'critical').default('warning'),
  isActive: Joi.boolean().default(true),
  notificationChannels: Joi.array().items(Joi.string()).default(['interface']),
  description: Joi.string().allow('')
});

exports.updateSchema = Joi.object({
  filterModelId: Joi.number().integer(),
  parameter: Joi.string().valid('time', 'volume'),
  threshold: Joi.number().positive(),
  unit: Joi.string().valid('days', 'liters', 'hours'),
  action: Joi.string().valid('warning', 'critical'),
  isActive: Joi.boolean(),
  notificationChannels: Joi.array().items(Joi.string()),
  description: Joi.string().allow('')
}).min(1);
