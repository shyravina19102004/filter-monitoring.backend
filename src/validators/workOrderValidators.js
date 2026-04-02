const Joi = require('joi');

exports.createWorkOrderSchema = Joi.object({
  workDate: Joi.date().required(),
  oldInstallationId: Joi.number().integer().allow(null),
  newInstallationId: Joi.number().integer().allow(null),
  workType: Joi.string().valid('replacement', 'inspection', 'repair').default('replacement'),
  performedBy: Joi.number().integer().allow(null),
  approvedBy: Joi.number().integer().allow(null),
  notes: Joi.string().allow(''),
  status: Joi.string().valid('draft', 'confirmed', 'cancelled').default('draft'),
  pdfPath: Joi.string().allow('')
});

exports.updateWorkOrderSchema = Joi.object({
  workDate: Joi.date(),
  oldInstallationId: Joi.number().integer().allow(null),
  newInstallationId: Joi.number().integer().allow(null),
  workType: Joi.string().valid('replacement', 'inspection', 'repair'),
  performedBy: Joi.number().integer().allow(null),
  approvedBy: Joi.number().integer().allow(null),
  notes: Joi.string().allow(''),
  status: Joi.string().valid('draft', 'confirmed', 'cancelled'),
  pdfPath: Joi.string().allow('')
}).min(1);
