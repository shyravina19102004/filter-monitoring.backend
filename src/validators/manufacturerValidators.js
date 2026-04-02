const Joi = require('joi');

// Схема для создания производителя
exports.createManufacturerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Название производителя обязательно',
    'any.required': 'Название производителя обязательно'
  }),
  country: Joi.string().allow('').optional()
});

// Схема для обновления производителя
exports.updateManufacturerSchema = Joi.object({
  name: Joi.string(),
  country: Joi.string().allow('')
}).min(1).messages({
  'object.min': 'Должно быть указано хотя бы одно поле для обновления'
});
