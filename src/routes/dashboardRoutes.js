const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Получить сводную информацию для дашборда
 *     description: Возвращает количество критических уведомлений, предстоящих замен, остатки на складе и эффективность.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ со сводкой
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criticalNotifications:
 *                   type: integer
 *                   example: 2
 *                 upcomingReplacements:
 *                   type: integer
 *                   example: 5
 *                 stockSummary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 48
 *                     lowStock:
 *                       type: integer
 *                       example: 3
 *                 efficiency:
 *                   type: number
 *                   format: float
 *                   example: 94.5
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/summary', authorize('reports:read'), controller.getSummary);

module.exports = router;