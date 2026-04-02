const Joi = require('joi');

exports.createSchema = Joi.object({
  meterId: Joi.number().integer().required(),
  value: Joi.number().positive().required(),
  readingDate: Joi.date().default(Date.now),
  notes: Joi.string().allow('')
});

exports.updateSchema = Joi.object({
  meterId: Joi.number().integer(),
  value: Joi.number().positive(),
  readingDate: Joi.date(),
  notes: Joi.string().allow('')
}).min(1);
