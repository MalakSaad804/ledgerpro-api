const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api', require('./routes/booking.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
