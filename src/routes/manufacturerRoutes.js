const express = require('express');
const router = express.Router();
const manufacturerController = require('../controllers/manufacturerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createManufacturerSchema, updateManufacturerSchema } = require('../validators/manufacturerValidators');

router.use(authenticate);

/**
 * @swagger
 * /manufacturers:
 *   get:
 *     summary: Получить список производителей
 *     tags: [Manufacturers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список производителей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Manufacturer'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('manufacturers:read'), manufacturerController.getAll);

/**
 * @swagger
 * /manufacturers/{id}:
 *   get:
 *     summary: Получить производителя по ID
 *     tags: [Manufacturers]
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
 *         description: Данные производителя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manufacturer'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('manufacturers:read'), manufacturerController.getOne);

/**
 * @swagger
 * /manufacturers:
 *   post:
 *     summary: Создать нового производителя
 *     tags: [Manufacturers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManufacturerInput'
 *     responses:
 *       201:
 *         description: Созданный производитель
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manufacturer'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('manufacturers:create'), validate(createManufacturerSchema), manufacturerController.create);

/**
 * @swagger
 * /manufacturers/{id}:
 *   put:
 *     summary: Обновить производителя
 *     tags: [Manufacturers]
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
 *             $ref: '#/components/schemas/ManufacturerInput'
 *     responses:
 *       200:
 *         description: Обновлённый производитель
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manufacturer'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('manufacturers:update'), validate(updateManufacturerSchema), manufacturerController.update);

/**
 * @swagger
 * /manufacturers/{id}:
 *   delete:
 *     summary: Удалить производителя
 *     tags: [Manufacturers]
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
 *         description: Производитель удалён
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('manufacturers:delete'), manufacturerController.delete);

module.exports = router;