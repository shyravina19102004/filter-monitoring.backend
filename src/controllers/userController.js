const { User, Role, Location } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');

// GET /api/users
exports.getUsers = async (req, res) => {
  const where = {};

  const accessibleLocationIds = await getAccessibleLocationIds(req.user);
  if (accessibleLocationIds !== null) {
    if (accessibleLocationIds.length === 0) {
      return res.json([]);
    }
    where.locationId = accessibleLocationIds;
  }

  const users = await User.findAll({
    where,
    include: [
      { model: Role, as: 'role', attributes: ['id', 'name'] },
      { model: Location, as: 'location', attributes: ['id', 'name'] }
    ],
    attributes: { exclude: ['passwordHash'] }
  });

  res.json(users);
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    include: [
      { model: Role, as: 'role' },
      { model: Location, as: 'location' }
    ],
    attributes: { exclude: ['passwordHash'] }
  });

  if (!user) {
    throw new ApiError(404, 'Пользователь не найден');
  }

  const accessibleLocationIds = await getAccessibleLocationIds(req.user);
  if (accessibleLocationIds !== null) {
    if (!accessibleLocationIds.includes(user.locationId) && req.user.id !== user.id) {
      throw new ApiError(403, 'Недостаточно прав для просмотра этого пользователя');
    }
  }

  res.json(user);
};

// POST /api/users
exports.createUser = async (req, res) => {
  const { email, password, fullName, roleId, locationId, phone, isActive } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'Пользователь с таким email уже существует');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    passwordHash,
    fullName,
    roleId,
    locationId,
    phone,
    isActive: isActive !== undefined ? isActive : true
  });

  const userResponse = newUser.toJSON();
  delete userResponse.passwordHash;

  res.status(201).json(userResponse);
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, fullName, roleId, locationId, phone, isActive } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, 'Пользователь не найден');
  }

  if (req.user.role.name !== 'admin' && req.user.id !== user.id) {
    throw new ApiError(403, 'Недостаточно прав для редактирования этого пользователя');
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'Пользователь с таким email уже существует');
    }
    user.email = email;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (roleId !== undefined) user.roleId = roleId;
  if (locationId !== undefined) user.locationId = locationId;
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  const updatedUser = await User.findByPk(id, {
    include: [
      { model: Role, as: 'role' },
      { model: Location, as: 'location' }
    ],
    attributes: { exclude: ['passwordHash'] }
  });

  res.json(updatedUser);
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, 'Пользователь не найден');
  }

  if (req.user.id === user.id) {
    throw new ApiError(400, 'Нельзя удалить самого себя');
  }

  await user.destroy();
  res.status(204).send();
};