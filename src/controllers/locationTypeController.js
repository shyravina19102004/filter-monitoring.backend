const { LocationType } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const types = await LocationType.findAll({ order: [['name', 'ASC']] });
  res.json(types);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const type = await LocationType.findByPk(id);
  if (!type) {
    throw new ApiError(404, 'Тип не найден');
  }
  res.json(type);
};

exports.create = async (req, res) => {
  const newType = await LocationType.create(req.body);
  res.status(201).json(newType);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const type = await LocationType.findByPk(id);
  if (!type) {
    throw new ApiError(404, 'Тип не найден');
  }
  await type.update(req.body);
  res.json(type);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const type = await LocationType.findByPk(id);
  if (!type) {
    throw new ApiError(404, 'Тип не найден');
  }
  await type.destroy();
  res.status(204).send();
};