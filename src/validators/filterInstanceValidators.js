const Joi = require('joi');

const createFilterInstanceSchema = Joi.object({
  filterModelId: Joi.number().integer().required(),
  serialNumber: Joi.string().allow(null),
  status: Joi.string().valid('in_stock', 'installed', 'written_off').default('in_stock'),
  purchaseDate: Joi.date().allow(null),
  installationDate: Joi.date().allow(null),
  warrantyEndDate: Joi.date().allow(null),
  notes: Joi.string().allow('')
});

const updateFilterInstanceSchema = Joi.object({
  filterModelId: Joi.number().integer(),
  serialNumber: Joi.string().allow(null),
  status: Joi.string().valid('in_stock', 'installed', 'written_off'),
  purchaseDate: Joi.date().allow(null),
  installationDate: Joi.date().allow(null),
  warrantyEndDate: Joi.date().allow(null),
  notes: Joi.string().allow('')
}).min(1);

module.exports = { createFilterInstanceSchema, updateFilterInstanceSchema };
