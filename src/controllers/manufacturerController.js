const { Manufacturer } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const manufacturers = await Manufacturer.findAll({
    order: [['name', 'ASC']]
  });
  res.json(manufacturers);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const manufacturer = await Manufacturer.findByPk(id);
  if (!manufacturer) {
    throw new ApiError(404, 'Производитель не найден');
  }
  res.json(manufacturer);
};

exports.create = async (req, res) => {
  const { name, country } = req.body;

  const existing = await Manufacturer.findOne({ where: { name } });
  if (existing) {
    throw new ApiError(409, 'Производитель с таким именем уже существует');
  }

  const newManufacturer = await Manufacturer.create({ name, country });
  res.status(201).json(newManufacturer);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, country } = req.body;

  const manufacturer = await Manufacturer.findByPk(id);
  if (!manufacturer) {
    throw new ApiError(404, 'Производитель не найден');
  }

  if (name && name !== manufacturer.name) {
    const existing = await Manufacturer.findOne({ where: { name } });
    if (existing) {
      throw new ApiError(409, 'Производитель с таким именем уже существует');
    }
    manufacturer.name = name;
  }

  if (country !== undefined) manufacturer.country = country;

  await manufacturer.save();
  res.json(manufacturer);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const manufacturer = await Manufacturer.findByPk(id);
  if (!manufacturer) {
    throw new ApiError(404, 'Производитель не найден');
  }
  await manufacturer.destroy();
  res.status(204).send();
};