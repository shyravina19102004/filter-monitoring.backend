const express = require('express');
const router = express.Router();
const controller = require('../controllers/fileController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/:type/:filename', controller.getFile);

module.exports = router;
