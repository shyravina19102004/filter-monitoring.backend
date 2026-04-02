const Joi = require('joi');

exports.createUnitSchema = Joi.object({
  name: Joi.string().required(),
  symbol: Joi.string().allow(''),
  description: Joi.string().allow('')
});

exports.updateUnitSchema = Joi.object({
  name: Joi.string(),
  symbol: Joi.string().allow(''),
  description: Joi.string().allow('')
}).min(1);
