const express = require('express');
const router = express.Router();
const filterTypeController = require('../controllers/filterTypeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createFilterTypeSchema, updateFilterTypeSchema } = require('../validators/filterTypeValidators');

router.use(authenticate);

/**
 * @swagger
 * /filter-types:
 *   get:
 *     summary: Получить список типов фильтров
 *     tags: [FilterTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список типов фильтров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FilterType'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('filter-types:read'), filterTypeController.getAll);

/**
 * @swagger
 * /filter-types/{id}:
 *   get:
 *     summary: Получить тип фильтра по ID
 *     tags: [FilterTypes]
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
 *               $ref: '#/components/schemas/FilterType'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('filter-types:read'), filterTypeController.getOne);

/**
 * @swagger
 * /filter-types:
 *   post:
 *     summary: Создать новый тип фильтра
 *     tags: [FilterTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilterTypeInput'
 *     responses:
 *       201:
 *         description: Созданный тип
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterType'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('filter-types:create'), validate(createFilterTypeSchema), filterTypeController.create);

/**
 * @swagger
 * /filter-types/{id}:
 *   put:
 *     summary: Обновить тип фильтра
 *     tags: [FilterTypes]
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
 *             $ref: '#/components/schemas/FilterTypeInput'
 *     responses:
 *       200:
 *         description: Обновлённый тип
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterType'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('filter-types:update'), validate(updateFilterTypeSchema), filterTypeController.update);

/**
 * @swagger
 * /filter-types/{id}:
 *   delete:
 *     summary: Удалить тип фильтра
 *     tags: [FilterTypes]
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
router.delete('/:id', authorize('filter-types:delete'), filterTypeController.delete);

module.exports = router;