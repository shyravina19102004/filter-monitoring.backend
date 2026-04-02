const Joi = require('joi');

exports.createFilterTypeSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('')
});

exports.updateFilterTypeSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('')
}).min(1);
