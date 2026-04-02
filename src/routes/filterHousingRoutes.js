const express = require('express');
const router = express.Router();
const controller = require('../controllers/filterHousingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/filterHousingValidators');

router.use(authenticate);

/**
 * @swagger
 * /filter-housings:
 *   get:
 *     summary: Получить список корпусов фильтров
 *     tags: [FilterHousings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: Фильтр по ID локации
 *     responses:
 *       200:
 *         description: Список корпусов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FilterHousing'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('filter-housings:read'), controller.getAll);

/**
 * @swagger
 * /filter-housings/{id}:
 *   get:
 *     summary: Получить корпус по ID
 *     tags: [FilterHousings]
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
 *         description: Данные корпуса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterHousing'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('filter-housings:read'), controller.getOne);

/**
 * @swagger
 * /filter-housings:
 *   post:
 *     summary: Создать новый корпус фильтра
 *     tags: [FilterHousings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilterHousingInput'
 *     responses:
 *       201:
 *         description: Созданный корпус
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterHousing'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('filter-housings:create'), validate(createSchema), controller.create);

/**
 * @swagger
 * /filter-housings/{id}:
 *   put:
 *     summary: Обновить корпус фильтра
 *     tags: [FilterHousings]
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
 *             $ref: '#/components/schemas/FilterHousingInput'
 *     responses:
 *       200:
 *         description: Обновлённый корпус
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterHousing'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('filter-housings:update'), validate(updateSchema), controller.update);

/**
 * @swagger
 * /filter-housings/{id}:
 *   delete:
 *     summary: Удалить корпус фильтра
 *     tags: [FilterHousings]
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
 *         description: Корпус удалён
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('filter-housings:delete'), controller.delete);

module.exports = router;