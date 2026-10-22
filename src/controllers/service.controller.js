const Service = require('../models/Service');

exports.list = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ name: 1 });
  res.json(services);
};

exports.create = async (req, res) => {
  const { name, description, durationMins, dailyCapacity } = req.body || {};
  const service = await Service.create({
    name, description, durationMins, dailyCapacity, createdBy: req.user.id,
  });
  res.status(201).json(service);
};

exports.update = async (req, res) => {
  const allowed = ['name', 'description', 'durationMins', 'dailyCapacity', 'isActive'];
  const updates = {};
  for (const key of allowed) if (req.body && key in req.body) updates[key] = req.body[key];
  const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Service not found' });
  res.json(service);
};

exports.remove = async (req, res) => {
  // soft delete keeps booking history intact
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) return res.status(404).json({ error: 'NOT_FOUND', message: 'Service not found' });
  res.json({ message: 'Service deactivated' });
};
