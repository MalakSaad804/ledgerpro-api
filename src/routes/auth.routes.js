const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { allow } = require('../middleware/role');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', protect, c.me);
router.post('/staff', protect, allow('admin'), c.createStaff);

module.exports = router;
