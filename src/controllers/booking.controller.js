const Booking = require('../models/Booking');

// customer: only their own bookings
exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id })
    .sort({ slotStart: -1 })
    .populate('service', 'name durationMins');
  res.json(bookings);
};

// staff/admin: all bookings
exports.allBookings = async (req, res) => {
  const bookings = await Booking.find()
    .sort({ slotStart: 1 })
    .populate('customer', 'name email')
    .populate('service', 'name');
  res.json(bookings);
};
