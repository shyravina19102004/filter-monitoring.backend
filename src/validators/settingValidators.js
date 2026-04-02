const Joi = require('joi');

exports.settingSchema = Joi.object({
  value: Joi.any().required()
}).unknown(true);
