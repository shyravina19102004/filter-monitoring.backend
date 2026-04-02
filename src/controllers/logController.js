const { Log, User } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.startDate && req.query.endDate) {
    where.createdAt = { [Op.between]: [req.query.startDate, req.query.endDate] };
  }
  if (req.query.level) where.level = req.query.level;
  if (req.query.userId) where.userId = req.query.userId;

  const { count, rows } = await Log.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
  res.json({ total: count, page, limit, data: rows });
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const log = await Log.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }]
  });
  if (!log) {
    throw new ApiError(404, 'Лог не найден');
  }
  res.json(log);
};

exports.deleteOld = async (req, res) => {
  const { days } = req.query;
  if (!days) {
    throw new ApiError(400, 'Не указано количество дней');
  }
  const date = new Date();
  date.setDate(date.getDate() - parseInt(days));
  const deleted = await Log.destroy({ where: { createdAt: { [Op.lt]: date } } });
  res.json({ message: `Удалено ${deleted} записей` });
};