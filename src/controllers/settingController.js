const { Setting } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const settings = await Setting.findAll();
  const result = {};
  settings.forEach(s => { result[s.key] = s.value; });
  res.json(result);
};

exports.getByKey = async (req, res) => {
  const { key } = req.params;
  const setting = await Setting.findOne({ where: { key } });
  if (!setting) {
    throw new ApiError(404, 'Настройка не найдена');
  }
  res.json({ key: setting.key, value: setting.value });
};

exports.updateBulk = async (req, res) => {
  const updates = Object.entries(req.body);
  for (const [key, value] of updates) {
    await Setting.upsert({ key, value });
  }
  const updated = await Setting.findAll();
  const result = {};
  updated.forEach(s => { result[s.key] = s.value; });
  res.json(result);
};

exports.updateOne = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const [setting] = await Setting.upsert({ key, value });
  res.json({ key: setting.key, value: setting.value });
};