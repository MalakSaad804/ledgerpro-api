exports.notFound = (req, res) =>
  res.status(404).json({ error: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid id format' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'DUPLICATE', message: 'Duplicate value' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'BAD_JSON', message: 'Malformed JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'SERVER_ERROR', message: 'Something went wrong' });
};
