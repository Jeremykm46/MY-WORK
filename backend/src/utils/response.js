const success = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const created = (res, data = null, message = 'Created successfully') =>
  success(res, data, message, 201);

const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const paginated = (res, data, pagination, message = 'Success') =>
  success(res, data, message, 200, pagination);

module.exports = { success, created, error, paginated };
