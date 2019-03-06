const express = require('express');
const apiController = require('../controllers/api-controller.js');
const questionsController = require('../controllers/questions-controller.js');
const authMiddleware = require('../middlewares/auth-middleware.js');
const router = express.Router();

router.use(authMiddleware());

router.get('/', apiController.get);

router.get('/questions/', questionsController.get);
router.get('/questions/:_id', questionsController.getUnique);
router.post('/questions/', questionsController.post);
router.delete('/questions/:_id', questionsController.delete);

module.exports = router;