// routes/departments.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/departments.controller');

// All authenticated users can list and read departments
router.get('/', auth('admin', 'evaluator', 'evaluatee'), ctrl.list);
router.get('/:id', auth('admin', 'evaluator', 'evaluatee'), ctrl.get);

module.exports = router;
