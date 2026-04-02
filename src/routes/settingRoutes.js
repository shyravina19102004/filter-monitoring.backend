const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { settingSchema } = require('../validators/settingValidators');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Управление настройками системы
 * 
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       additionalProperties:
 *         type: any
 *       example:
 *         toir.apiUrl: "http://toir.example.com/api"
 *         toir.apiKey: "secret"
 *         toir.syncCron: "0 2 * * *"
 */

router.use(authenticate);

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Получить все настройки системы
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Объект со всеми настройками (ключ-значение)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.get('/', authorize('settings:read'), controller.getAll);

/**
 * @swagger
 * /settings/{key}:
 *   get:
 *     summary: Получить значение настройки по ключу
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Ключ настройки
 *     responses:
 *       200:
 *         description: Объект с ключом и значением
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: any
 *       404:
 *         description: Настройка не найдена
 */
router.get('/:key', authorize('settings:read'), controller.getByKey);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Массовое обновление настроек
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: any
 *             example:
 *               toir.apiUrl: "http://new-url.com"
 *               toir.apiKey: "new-key"
 *     responses:
 *       200:
 *         description: Обновлённый объект настроек
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.put('/', authorize('settings:update'), validate(settingSchema), controller.updateBulk);

/**
 * @swagger
 * /settings/{key}:
 *   put:
 *     summary: Обновить одну настройку по ключу
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: any
 *     responses:
 *       200:
 *         description: Обновлённая настройка
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: any
 */
router.put('/:key', authorize('settings:update'), validate(settingSchema), controller.updateOne);

module.exports = router;