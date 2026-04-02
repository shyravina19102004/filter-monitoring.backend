const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

/**
 * @swagger
 * /reports/violations:
 *   get:
 *     summary: Отчёт по нарушениям сроков ТО
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: ID локации
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *         description: Формат отчёта (по умолчанию json)
 *     responses:
 *       200:
 *         description: Отчёт
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/violations', authorize('reports:read'), controller.getViolations);

/**
 * @swagger
 * /reports/usage-analysis:
 *   get:
 *     summary: Анализ наработки фильтров
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *     responses:
 *       200:
 *         description: Отчёт
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/usage-analysis', authorize('reports:read'), controller.getUsageAnalysis);

/**
 * @swagger
 * /reports/forecast:
 *   get:
 *     summary: Прогноз расхода фильтров
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Количество месяцев прогноза
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *     responses:
 *       200:
 *         description: Отчёт
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/forecast', authorize('reports:read'), controller.getForecast);

/**
 * @swagger
 * /reports/efficiency:
 *   get:
 *     summary: Эффективность мастеров
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *     responses:
 *       200:
 *         description: Отчёт
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/efficiency', authorize('reports:read'), controller.getEfficiency);

/**
 * @swagger
 * /reports/stock:
 *   get:
 *     summary: Складские остатки фильтров
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *     responses:
 *       200:
 *         description: Отчёт
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/stock', authorize('reports:read'), controller.getStock);

/**
 * @swagger
 * /reports/dynamics:
 *   get:
 *     summary: Динамика показателей (графики)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: month
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, xlsx]
 *     responses:
 *       200:
 *         description: Отчёт
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/dynamics', authorize('reports:read'), controller.getDynamics);

/**
 * @swagger
 * /reports/export:
 *   get:
 *     summary: Универсальный экспорт отчёта (редирект на конкретный тип)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [violations, usage, forecast, efficiency, stock, dynamics]
 *         description: Тип отчёта
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, xlsx]
 *           default: pdf
 *       - другие параметры, специфичные для выбранного типа
 *     responses:
 *       200:
 *         description: Файл отчёта
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/export', authorize('reports:read'), controller.exportReport);

module.exports = router;