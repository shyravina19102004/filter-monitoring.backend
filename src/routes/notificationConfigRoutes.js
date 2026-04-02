const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationConfigController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/notificationConfigValidators');

/**
 * @swagger
 * tags:
 *   name: NotificationConfigs
 *   description: Управление конфигурациями каналов уведомлений
 * 
 * components:
 *   schemas:
 *     NotificationConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         channel:
 *           type: string
 *           enum: [telegram, email, sms]
 *         config:
 *           type: object
 *           description: Настройки канала (зависят от типа)
 *         isActive:
 *           type: boolean
 *           default: true
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.use(authenticate);

/**
 * @swagger
 * /notification-configs:
 *   get:
 *     summary: Получить список всех конфигураций уведомлений
 *     tags: [NotificationConfigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список конфигураций
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationConfig'
 */
router.get('/', authorize('notification-configs:read'), controller.getAll);

/**
 * @swagger
 * /notification-configs/{id}:
 *   get:
 *     summary: Получить конфигурацию по ID
 *     tags: [NotificationConfigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID конфигурации
 *     responses:
 *       200:
 *         description: Конфигурация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationConfig'
 *       404:
 *         description: Конфигурация не найдена
 */
router.get('/:id', authorize('notification-configs:read'), controller.getOne);

/**
 * @swagger
 * /notification-configs:
 *   post:
 *     summary: Создать новую конфигурацию уведомлений
 *     tags: [NotificationConfigs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel
 *               - config
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [telegram, email, sms]
 *               config:
 *                 type: object
 *                 description: Объект с параметрами (botToken, chatId для telegram; host, port, auth и т.д. для email)
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Созданная конфигурация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationConfig'
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', authorize('notification-configs:create'), validate(createSchema), controller.create);

/**
 * @swagger
 * /notification-configs/{id}:
 *   put:
 *     summary: Обновить существующую конфигурацию
 *     tags: [NotificationConfigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [telegram, email, sms]
 *               config:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлённая конфигурация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationConfig'
 *       404:
 *         description: Конфигурация не найдена
 */
router.put('/:id', authorize('notification-configs:update'), validate(updateSchema), controller.update);

/**
 * @swagger
 * /notification-configs/{id}:
 *   delete:
 *     summary: Удалить конфигурацию уведомлений
 *     tags: [NotificationConfigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Успешно удалено
 *       404:
 *         description: Конфигурация не найдена
 */
router.delete('/:id', authorize('notification-configs:delete'), controller.delete);

module.exports = router;