const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');

module.exports = (req, res, next) => {
  const token = req.cookie.jwt;
  if (!token) {
    throw new UnauthorizedError('Пользователь не авторизован');
  }

  let payload;

  try {
    payload = jwt.verify(token, 'this-is-secret-code');
  } catch (err) {
    next(new UnauthorizedError('Пользователь не авторизован'));
  }

  req.user = payload;

  return next();
};
