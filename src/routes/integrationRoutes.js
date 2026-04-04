const express = require('express');
const router = express.Router();
const controller = require('../controllers/integrationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   name: Integrations
 *   description: Управление интеграциями с внешними системами (ТОИР, уведомления)
 */

router.use(authenticate);

/**
 * @swagger
 * /integrations/status:
 *   get:
 *     summary: Получить статус всех интеграций
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Текущий статус интеграций
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 toir:
 *                   type: object
 *                   properties:
 *                     lastSync:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-03-16T10:30:00Z"
 *                     lastStatus:
 *                       type: string
 *                       enum: [success, error, skipped, unknown]
 *                       example: "success"
 *                 notificationChannels:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       description:
 *                         type: string
 *                         example: "Email-уведомления"
 */
router.get('/status', authorize('settings:read'), controller.getStatus);

/**
 * @swagger
 * /integrations/toir/sync:
 *   post:
 *     summary: Запустить ручную синхронизацию с системой ТОИР
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Синхронизация запущена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Синхронизация с ТОИР запущена"
 *       403:
 *         description: Недостаточно прав
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/toir/sync', authorize('settings:update'), controller.syncToir);

/**
 * @swagger
 * /integrations/toir/logs:
 *   get:
 *     summary: Получить последние логи синхронизации с ТОИР
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Количество записей
 *     responses:
 *       200:
 *         description: Массив логов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 * 
 */
router.get('/toir/logs', authorize('logs:read'), controller.getSyncLogs);

module.exports = router;