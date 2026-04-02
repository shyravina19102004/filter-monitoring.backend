const Joi = require('joi');

exports.createSchema = Joi.object({
  channel: Joi.string().valid('telegram', 'email', 'sms').required(),
  config: Joi.object().required(),
  isActive: Joi.boolean().default(true),
  description: Joi.string().allow('')
});

exports.updateSchema = Joi.object({
  channel: Joi.string().valid('telegram', 'email', 'sms'),
  config: Joi.object(),
  isActive: Joi.boolean(),
  description: Joi.string().allow('')
}).min(1);
