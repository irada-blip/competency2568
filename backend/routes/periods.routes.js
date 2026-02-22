// routes/periods.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/periods.controller');

// All authenticated users can list and read
router.get('/', auth('admin', 'evaluator', 'evaluatee'), ctrl.list);
router.get('/:id', auth('admin', 'evaluator', 'evaluatee'), ctrl.get);

// Only admin can create, update, delete
router.post('/', auth('admin'), ctrl.create);
router.put('/:id', auth('admin'), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.delete);

module.exports = router;
