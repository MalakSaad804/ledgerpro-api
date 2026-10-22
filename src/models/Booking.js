const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    slotStart: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

// "my bookings" for a customer, newest first
bookingSchema.index({ customer: 1, slotStart: -1 });
// capacity check per service per day / staff calendar view
bookingSchema.index({ service: 1, slotStart: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
