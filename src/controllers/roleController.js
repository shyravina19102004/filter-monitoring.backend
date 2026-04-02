const { Role, Permission } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const roles = await Role.findAll({
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
  });
  res.json(roles);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id, {
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
  });
  if (!role) {
    throw new ApiError(404, 'Роль не найдена');
  }
  res.json(role);
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  const role = await Role.create({ name, description });
  res.status(201).json(role);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);
  if (!role) {
    throw new ApiError(404, 'Роль не найдена');
  }
  await role.update(req.body);
  res.json(role);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);
  if (!role) {
    throw new ApiError(404, 'Роль не найдена');
  }
  await role.destroy();
  res.status(204).send();
};

// PUT /api/roles/:id/permissions
exports.setPermissions = async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  const role = await Role.findByPk(id);
  if (!role) {
    throw new ApiError(404, 'Роль не найдена');
  }

  await role.setPermissions(permissionIds);
  const updatedRole = await Role.findByPk(id, {
    include: [{ model: Permission, as: 'permissions' }]
  });
  res.json(updatedRole);
};

// GET /api/permissions
exports.getAllPermissions = async (req, res) => {
  const permissions = await Permission.findAll({
    order: [['resource', 'ASC'], ['action', 'ASC']]
  });
  res.json(permissions);
};