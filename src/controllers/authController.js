const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Role } = require('../models');
const ApiError = require('../utils/ApiError');

// Генерация JWT токена
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role.name,
    locationId: user.locationId,
    permissions: user.role.permissions?.map(p => p.name) || []
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email и пароль обязательны');
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          include: ['permissions']
        }
      ]
    });

    if (!user) {
      throw new ApiError(401, 'Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Учётная запись заблокирована');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Неверный email или пароль');
    }

    await user.update({ lastLoginAt: new Date() });

    const token = generateToken(user);

    const userData = user.toJSON();
    delete userData.passwordHash;

    res.json({ token, user: userData });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user.toJSON();
    delete user.passwordHash;
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { fullName, phone, currentPassword, newPassword } = req.body;
    const user = req.user;

    if (newPassword) {
      if (!currentPassword) {
        throw new ApiError(400, 'Для смены пароля укажите текущий пароль');
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new ApiError(400, 'Неверный текущий пароль');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashedPassword;
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role', include: ['permissions'] }],
      attributes: { exclude: ['passwordHash'] }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};