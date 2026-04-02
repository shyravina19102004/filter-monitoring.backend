const express = require('express');
const router = express.Router();
const controller = require('../controllers/locationTypeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/locationTypeValidators');

router.use(authenticate);

/**
 * @swagger
 * /location-types:
 *   get:
 *     summary: Получить список типов локаций
 *     tags: [LocationTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список типов локаций
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LocationType'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('location-types:read'), controller.getAll);

/**
 * @swagger
 * /location-types/{id}:
 *   get:
 *     summary: Получить тип локации по ID
 *     tags: [LocationTypes]
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
 *         description: Данные типа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationType'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('location-types:read'), controller.getOne);

/**
 * @swagger
 * /location-types:
 *   post:
 *     summary: Создать новый тип локации
 *     tags: [LocationTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationTypeInput'
 *     responses:
 *       201:
 *         description: Созданный тип
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationType'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('location-types:create'), validate(createSchema), controller.create);

/**
 * @swagger
 * /location-types/{id}:
 *   put:
 *     summary: Обновить тип локации
 *     tags: [LocationTypes]
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
 *             $ref: '#/components/schemas/LocationTypeInput'
 *     responses:
 *       200:
 *         description: Обновлённый тип
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationType'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('location-types:update'), validate(updateSchema), controller.update);

/**
 * @swagger
 * /location-types/{id}:
 *   delete:
 *     summary: Удалить тип локации
 *     tags: [LocationTypes]
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
 *         description: Тип удалён
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('location-types:delete'), controller.delete);

module.exports = router;