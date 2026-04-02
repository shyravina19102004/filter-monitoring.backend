const Joi = require('joi');

exports.createSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('label', 'work_order', 'report').required(),
  content: Joi.string().required(),
  orientation: Joi.string().valid('portrait', 'landscape').default('portrait'),
  pageSize: Joi.string().default('A4'),
  isDefault: Joi.boolean().default(false)
});

exports.updateSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().valid('label', 'work_order', 'report'),
  content: Joi.string(),
  orientation: Joi.string().valid('portrait', 'landscape'),
  pageSize: Joi.string(),
  isDefault: Joi.boolean()
}).min(1);
