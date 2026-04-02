const express = require('express');
const router = express.Router();
const filterModelController = require('../controllers/filterModelController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createFilterModelSchema, updateFilterModelSchema } = require('../validators/filterModelValidators');

router.use(authenticate);

/**
 * @swagger
 * /filter-models:
 *   get:
 *     summary: Получить список моделей фильтров
 *     tags: [FilterModels]
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
 *         name: filterTypeId
 *         schema:
 *           type: integer
 *         description: Фильтр по типу фильтра
 *       - in: query
 *         name: manufacturerId
 *         schema:
 *           type: integer
 *         description: Фильтр по производителю
 *     responses:
 *       200:
 *         description: Список моделей с пагинацией
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
 *                     $ref: '#/components/schemas/FilterModel'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('filter-models:read'), filterModelController.getAll);

/**
 * @swagger
 * /filter-models/{id}:
 *   get:
 *     summary: Получить модель фильтра по ID
 *     tags: [FilterModels]
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
 *         description: Данные модели
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterModel'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('filter-models:read'), filterModelController.getOne);

/**
 * @swagger
 * /filter-models:
 *   post:
 *     summary: Создать новую модель фильтра
 *     tags: [FilterModels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilterModelInput'
 *     responses:
 *       201:
 *         description: Созданная модель
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterModel'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('filter-models:create'), validate(createFilterModelSchema), filterModelController.create);

/**
 * @swagger
 * /filter-models/{id}:
 *   put:
 *     summary: Обновить модель фильтра
 *     tags: [FilterModels]
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
 *             $ref: '#/components/schemas/FilterModelInput'
 *     responses:
 *       200:
 *         description: Обновлённая модель
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterModel'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('filter-models:update'), validate(updateFilterModelSchema), filterModelController.update);

/**
 * @swagger
 * /filter-models/{id}:
 *   delete:
 *     summary: Удалить модель фильтра
 *     tags: [FilterModels]
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
 *         description: Модель удалена
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('filter-models:delete'), filterModelController.delete);

module.exports = router;