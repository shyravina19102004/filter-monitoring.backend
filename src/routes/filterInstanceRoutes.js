const express = require('express');
const router = express.Router();
const filterInstanceController = require('../controllers/filterInstanceController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createFilterInstanceSchema, updateFilterInstanceSchema } = require('../validators/filterInstanceValidators');

router.use(authenticate);

/**
 * @swagger
 * /filter-instances:
 *   get:
 *     summary: Получить список экземпляров фильтров
 *     tags: [FilterInstances]
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
 *         name: filterModelId
 *         schema:
 *           type: integer
 *         description: Фильтр по модели фильтра
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_stock, installed, written_off]
 *         description: Статус экземпляра
 *     responses:
 *       200:
 *         description: Список экземпляров с пагинацией
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
 *                     $ref: '#/components/schemas/FilterInstance'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('filter-instances:read'), filterInstanceController.getAll);

/**
 * @swagger
 * /filter-instances/{id}:
 *   get:
 *     summary: Получить экземпляр фильтра по ID
 *     tags: [FilterInstances]
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
 *         description: Данные экземпляра
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterInstance'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('filter-instances:read'), filterInstanceController.getOne);

/**
 * @swagger
 * /filter-instances:
 *   post:
 *     summary: Добавить новый экземпляр фильтра на склад
 *     tags: [FilterInstances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilterInstanceInput'
 *     responses:
 *       201:
 *         description: Созданный экземпляр
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterInstance'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('filter-instances:create'), validate(createFilterInstanceSchema), filterInstanceController.create);

/**
 * @swagger
 * /filter-instances/{id}:
 *   put:
 *     summary: Обновить данные экземпляра фильтра
 *     tags: [FilterInstances]
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
 *             $ref: '#/components/schemas/FilterInstanceInput'
 *     responses:
 *       200:
 *         description: Обновлённый экземпляр
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterInstance'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('filter-instances:update'), validate(updateFilterInstanceSchema), filterInstanceController.update);

/**
 * @swagger
 * /filter-instances/{id}:
 *   delete:
 *     summary: Удалить экземпляр фильтра (только если не установлен)
 *     tags: [FilterInstances]
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
 *         description: Экземпляр удалён
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('filter-instances:delete'), filterInstanceController.delete);

/**
 * @swagger
 * /filter-instances/{id}/write-off:
 *   patch:
 *     summary: Списать экземпляр фильтра
 *     tags: [FilterInstances]
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
 *         description: Обновлённый экземпляр со статусом written_off
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterInstance'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.patch('/:id/write-off', authorize('filter-instances:update'), filterInstanceController.writeOff);

/**
 * @swagger
 * /filter-instances/{id}/label:
 *   get:
 *     summary: Сгенерировать PDF-этикетку для установленного фильтра
 *     tags: [FilterInstances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID экземпляра фильтра
 *     responses:
 *       200:
 *         description: PDF-файл этикетки
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id/label', authorize('filter-instances:read'), filterInstanceController.generateLabel);

module.exports = router;