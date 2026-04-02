const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentTemplateController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/documentTemplateValidators');

// Все маршруты защищены аутентификацией
router.use(authenticate);

/**
 * @swagger
 * /document-templates:
 *   get:
 *     summary: Получить список шаблонов документов
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [label, work_order, report]
 *         description: Фильтр по типу шаблона
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
 *     responses:
 *       200:
 *         description: Список шаблонов с пагинацией
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
 *                     $ref: '#/components/schemas/DocumentTemplate'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authorize('document-templates:read'), controller.getAll);

/**
 * @swagger
 * /document-templates/{id}:
 *   get:
 *     summary: Получить шаблон по ID
 *     tags: [DocumentTemplates]
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
 *         description: Данные шаблона
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentTemplate'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', authorize('document-templates:read'), controller.getOne);

/**
 * @swagger
 * /document-templates:
 *   post:
 *     summary: Создать новый шаблон документа
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentTemplateInput'
 *     responses:
 *       201:
 *         description: Созданный шаблон
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentTemplate'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authorize('document-templates:create'), validate(createSchema), controller.create);

/**
 * @swagger
 * /document-templates/{id}:
 *   put:
 *     summary: Обновить шаблон документа
 *     tags: [DocumentTemplates]
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
 *             $ref: '#/components/schemas/DocumentTemplateInput'
 *     responses:
 *       200:
 *         description: Обновлённый шаблон
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentTemplate'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorize('document-templates:update'), validate(updateSchema), controller.update);

/**
 * @swagger
 * /document-templates/{id}:
 *   delete:
 *     summary: Удалить шаблон документа
 *     tags: [DocumentTemplates]
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
 *         description: Шаблон удалён
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorize('document-templates:delete'), controller.delete);

module.exports = router;