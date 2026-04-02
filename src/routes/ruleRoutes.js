const express = require('express');
const router = express.Router();
const controller = require('../controllers/ruleController');
const ruleCheckController = require('../controllers/ruleCheckController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSchema, updateSchema } = require('../validators/ruleValidators');

router.use(authenticate);

router.get('/', authorize('rules:read'), controller.getAll);
router.get('/:id', authorize('rules:read'), controller.getOne);
router.post('/', authorize('rules:create'), validate(createSchema), controller.create);
router.put('/:id', authorize('rules:update'), validate(updateSchema), controller.update);
router.delete('/:id', authorize('rules:delete'), controller.delete);

/**
 * @swagger
 * /rules/check:
 *   post:
 *     summary: Запустить ручную проверку правил для всех активных установок
 *     description: Запускает движок правил, который проверяет все активные установки на превышение лимитов и создает уведомления. Доступно для администраторов и мастеров.
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Проверка успешно запущена и завершена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Проверка правил запущена и завершена успешно
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong!
 */
router.post('/check', authorize('rules:update'), ruleCheckController.manualCheck);

module.exports = router;