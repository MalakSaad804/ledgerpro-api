const router = require('express').Router();
const c = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');
const { allow } = require('../middleware/role');

router.get('/customer/bookings', protect, allow('customer'), c.myBookings);
router.get('/staff/bookings', protect, allow('staff', 'admin'), c.allBookings);

module.exports = router;
