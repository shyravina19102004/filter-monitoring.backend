const { DocumentTemplate } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.type) where.type = req.query.type;

  const { count, rows } = await DocumentTemplate.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
    distinct: true
  });

  res.json({ total: count, page, limit, data: rows });
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const template = await DocumentTemplate.findByPk(id);
  if (!template) {
    throw new ApiError(404, 'Шаблон не найден');
  }
  res.json(template);
};

exports.create = async (req, res) => {
  const template = await DocumentTemplate.create(req.body);
  res.status(201).json(template);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const template = await DocumentTemplate.findByPk(id);
  if (!template) {
    throw new ApiError(404, 'Шаблон не найден');
  }
  await template.update(req.body);
  res.json(template);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const template = await DocumentTemplate.findByPk(id);
  if (!template) {
    throw new ApiError(404, 'Шаблон не найден');
  }
  await template.destroy();
  res.status(204).send();
};