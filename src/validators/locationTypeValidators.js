const Joi = require('joi');

exports.createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('')
});

exports.updateSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('')
}).min(1);
