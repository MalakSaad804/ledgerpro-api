const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

// email already indexed via unique:true; role index helps staff/admin listings
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
