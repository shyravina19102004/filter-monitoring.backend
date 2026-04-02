const express = require('express');
const router = express.Router();
const controller = require('../controllers/meterController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/meterValidators');

router.use(authenticate);

/**
 * @swagger
 * /meters:
 *   get:
 *     summary: Получить список счётчиков
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: Фильтр по локации
 *     responses:
 *       200:
 *         description: Список счётчиков
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meter'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('meters:read'), controller.getAll);

/**
 * @swagger
 * /meters/{id}:
 *   get:
 *     summary: Получить счётчик по ID
 *     tags: [Meters]
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
 *         description: Данные счётчика
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meter'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('meters:read'), controller.getOne);

/**
 * @swagger
 * /meters:
 *   post:
 *     summary: Создать новый счётчик
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeterInput'
 *     responses:
 *       201:
 *         description: Созданный счётчик
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meter'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('meters:create'), validate(createSchema), controller.create);

/**
 * @swagger
 * /meters/{id}:
 *   put:
 *     summary: Обновить счётчик
 *     tags: [Meters]
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
 *             $ref: '#/components/schemas/MeterInput'
 *     responses:
 *       200:
 *         description: Обновлённый счётчик
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meter'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('meters:update'), validate(updateSchema), controller.update);

/**
 * @swagger
 * /meters/{id}:
 *   delete:
 *     summary: Удалить счётчик
 *     tags: [Meters]
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
 *         description: Счётчик удалён
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('meters:delete'), controller.delete);

module.exports = router;