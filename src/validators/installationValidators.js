const Joi = require('joi');

exports.createInstallationSchema = Joi.object({
  housingId: Joi.number().integer().required(),
  filterInstanceId: Joi.number().integer().required(),
  installationDate: Joi.date().required(),
  meterId: Joi.number().integer().allow(null),
  meterReadingAtInstall: Joi.number().positive().allow(null),
  notes: Joi.string().allow('')
});
