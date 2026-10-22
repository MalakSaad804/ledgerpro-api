const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    durationMins: { type: Number, required: true, min: 15 },
    dailyCapacity: { type: Number, default: 5, min: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// public listing: active services sorted by name
serviceSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model('Service', serviceSchema);
