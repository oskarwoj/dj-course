const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Duplicate entry (unique constraint violation)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  // Foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Foreign key violation' });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
