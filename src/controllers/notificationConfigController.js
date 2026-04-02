const { NotificationConfig } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const configs = await NotificationConfig.findAll({
    order: [['channel', 'ASC'], ['createdAt', 'DESC']]
  });
  res.json(configs);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const config = await NotificationConfig.findByPk(id);
  if (!config) {
    throw new ApiError(404, 'Конфигурация не найдена');
  }
  res.json(config);
};

exports.create = async (req, res) => {
  const newConfig = await NotificationConfig.create(req.body);
  res.status(201).json(newConfig);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const config = await NotificationConfig.findByPk(id);
  if (!config) {
    throw new ApiError(404, 'Конфигурация не найдена');
  }
  await config.update(req.body);
  res.json(config);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const config = await NotificationConfig.findByPk(id);
  if (!config) {
    throw new ApiError(404, 'Конфигурация не найдена');
  }
  await config.destroy();
  res.status(204).send();
};