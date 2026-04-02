const { Unit } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const units = await Unit.findAll({
    order: [['name', 'ASC']]
  });
  res.json(units);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const unit = await Unit.findByPk(id);
  if (!unit) {
    throw new ApiError(404, 'Единица измерения не найдена');
  }
  res.json(unit);
};

exports.create = async (req, res) => {
  const { name, symbol, description } = req.body;
  const newUnit = await Unit.create({ name, symbol, description });
  res.status(201).json(newUnit);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const unit = await Unit.findByPk(id);
  if (!unit) {
    throw new ApiError(404, 'Единица измерения не найдена');
  }
  await unit.update(req.body);
  res.json(unit);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const unit = await Unit.findByPk(id);
  if (!unit) {
    throw new ApiError(404, 'Единица измерения не найдена');
  }
  await unit.destroy();
  res.status(204).send();
};