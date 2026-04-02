const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createLocationSchema, updateLocationSchema } = require('../validators/locationValidators');

router.use(authenticate);

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Получить список локаций (плоский)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: Фильтр по родительской локации (null для корневых)
 *       - in: query
 *         name: locationTypeId
 *         schema:
 *           type: integer
 *         description: Фильтр по типу локации
 *     responses:
 *       200:
 *         description: Список локаций
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('locations:read'), locationController.getAll);

/**
 * @swagger
 * /locations/tree:
 *   get:
 *     summary: Получить иерархическое дерево локаций (плоский список, фронтенд строит дерево)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Плоский список локаций, доступных пользователю
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/tree', authorize('locations:read'), locationController.getTree);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Получить локацию по ID с дочерними элементами
 *     tags: [Locations]
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
 *         description: Данные локации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('locations:read'), locationController.getOne);

/**
 * @swagger
 * /locations/{id}/hierarchy:
 *   get:
 *     summary: Получить поддерево локации (все потомки)
 *     tags: [Locations]
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
 *         description: Список локаций – потомков (включая корневую)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id/hierarchy', authorize('locations:read'), locationController.getHierarchy);

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Создать новую локацию
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationInput'
 *     responses:
 *       201:
 *         description: Созданная локация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('locations:create'), validate(createLocationSchema), locationController.create);

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Обновить локацию
 *     tags: [Locations]
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
 *             $ref: '#/components/schemas/LocationInput'
 *     responses:
 *       200:
 *         description: Обновлённая локация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('locations:update'), validate(updateLocationSchema), locationController.update);

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Удалить локацию (только если нет дочерних элементов)
 *     tags: [Locations]
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
 *         description: Локация удалена
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('locations:delete'), locationController.delete);

module.exports = router;