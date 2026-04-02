const express = require('express');
const router = express.Router();
const controller = require('../controllers/installationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createInstallationSchema } = require('../validators/installationValidators');

router.use(authenticate);

/**
 * @swagger
 * /installations:
 *   get:
 *     summary: Получить список установок фильтров
 *     tags: [Installations]
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
 *         name: housingId
 *         schema:
 *           type: integer
 *         description: Фильтр по корпусу
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Фильтр по активности
 *     responses:
 *       200:
 *         description: Список установок с пагинацией
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
 *                     $ref: '#/components/schemas/Installation'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('installations:read'), controller.getAll);

/**
 * @swagger
 * /installations/{id}:
 *   get:
 *     summary: Получить установку по ID
 *     tags: [Installations]
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
 *         description: Данные установки
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Installation'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('installations:read'), controller.getOne);

/**
 * @swagger
 * /installations/history/{housingId}:
 *   get:
 *     summary: Получить историю установок для корпуса
 *     tags: [Installations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID корпуса
 *     responses:
 *       200:
 *         description: Список установок для корпуса
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Installation'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/history/:housingId', authorize('installations:read'), controller.getHistoryByHousing);

/**
 * @swagger
 * /installations:
 *   post:
 *     summary: Создать новую установку (замена фильтра)
 *     tags: [Installations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstallationInput'
 *     responses:
 *       201:
 *         description: Созданная установка
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Installation'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('installations:create'), validate(createInstallationSchema), controller.create);

/**
 * @swagger
 * /installations/{id}:
 *   delete:
 *     summary: Удалить установку (только неактивную)
 *     tags: [Installations]
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
 *         description: Установка удалена
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('installations:delete'), controller.delete);

module.exports = router;