const express = require('express');
const {
  getDependents,
  createDependent,
  updateDependent,
  deleteDependent,
} = require('../controllers/dependentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getDependents);
router.post('/', createDependent);
router.put('/:id', updateDependent);
router.delete('/:id', deleteDependent);

module.exports = router;