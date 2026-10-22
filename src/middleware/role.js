// usage: allow('staff', 'admin') — must run after protect
exports.allow = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not have access to this resource' });
  }
  next();
};
