// routes/results.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/results.controller');

// All authenticated users can list and read
router.get('/', auth('admin', 'evaluator', 'evaluatee'), ctrl.list);
router.get('/:id', auth('admin', 'evaluator', 'evaluatee'), ctrl.get);

// All authenticated users can create (evaluators create for their assignments)
router.post('/', auth('admin', 'evaluator', 'evaluatee'), ctrl.create);

// All authenticated users can update (with proper authorization checks in controller if needed)
router.put('/:id', auth('admin', 'evaluator', 'evaluatee'), ctrl.update);

// Only admin can delete
router.delete('/:id', auth('admin'), ctrl.delete);

module.exports = router;
