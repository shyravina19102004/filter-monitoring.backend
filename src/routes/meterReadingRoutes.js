const express = require('express');
const router = express.Router();
const controller = require('../controllers/meterReadingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/meterReadingValidators');

router.use(authenticate);

/**
 * @swagger
 * /meter-readings:
 *   get:
 *     summary: Получить список показаний счётчиков
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на странице
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: integer
 *         description: Фильтр по счётчику
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
 *     responses:
 *       200:
 *         description: Список показаний с пагинацией
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MeterReading'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('meter-readings:read'), controller.getAll);

/**
 * @swagger
 * /meter-readings/{id}:
 *   get:
 *     summary: Получить показание по ID
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные показания
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterReading'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('meter-readings:read'), controller.getOne);

/**
 * @swagger
 * /meter-readings:
 *   post:
 *     summary: Внести новое показание счётчика
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeterReadingInput'
 *     responses:
 *       201:
 *         description: Созданное показание
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterReading'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('meter-readings:create'), validate(createSchema), controller.create);

/**
 * @swagger
 * /meter-readings/{id}:
 *   put:
 *     summary: Обновить показание (только администратор)
 *     tags: [MeterReadings]
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
 *             $ref: '#/components/schemas/MeterReadingInput'
 *     responses:
 *       200:
 *         description: Обновлённое показание
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterReading'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('meter-readings:update'), validate(updateSchema), controller.update);

/**
 * @swagger
 * /meter-readings/{id}:
 *   delete:
 *     summary: Удалить показание (только администратор)
 *     tags: [MeterReadings]
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
 *         description: Показание удалено
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('meter-readings:delete'), controller.delete);

module.exports = router;