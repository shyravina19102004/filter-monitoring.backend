const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Импортируем модели Sequelize
const { User, Role } = require('../models');

// Middleware для аутентификации и авторизации
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Утилита для доступа к локациям
const { getAccessibleLocationIds } = require('../utils/locationAccess');

console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Resolved .env path:', path.join(__dirname, '../../.env'));

console.log('DB_PASSWORD from env:', process.env.DB_PASSWORD ? 'set' : 'undefined');
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const sequelizeTemp = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

/**
 * @swagger
 * /test/health:
 *   get:
 *     summary: Проверка подключения к базе данных
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Статус подключения
 */
router.get('/health', async (req, res) => {
  try {
    await sequelizeTemp.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

/**
 * @swagger
 * /test/models:
 *   get:
 *     summary: Проверка моделей и связей
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Данные из моделей
 */
router.get('/models', async (req, res) => {
  try {
    const roles = await Role.findAll();
    const users = await User.findAll({ include: ['role'] });
    res.json({ roles, users });
  } catch (error) {
    console.error('Models test error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /test/protected:
 *   get:
 *     summary: Тестовый защищённый маршрут (требует users:read)
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ с данными пользователя
 *       403:
 *         description: Недостаточно прав
 */
router.get('/protected', authenticate, authorize('users:read'), (req, res) => {
  res.json({
    message: 'Доступ разрешён',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role.name,
      permissions: req.user.role.permissions.map(p => p.name)
    }
  });
});

/**
 * @swagger
 * /test/locations/accessible:
 *   get:
 *     summary: Получить список доступных локаций для текущего пользователя
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список ID доступных локаций
 */
router.get('/locations/accessible', authenticate, async (req, res, next) => {
  try {
    const ids = await getAccessibleLocationIds(req.user);
    res.json({ accessibleLocationIds: ids });
  } catch (error) {
    next(error);
  }
});

module.exports = router;