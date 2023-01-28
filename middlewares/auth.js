const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');

module.exports = (req, res, next) => {
  /* const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Пользователь не авторизован'));
  } */
  const { cookie } = req.headers;

  const token = cookie.find((obj) => obj.match('token')).replace('token=', '');

  if (!token) {
    next(new UnauthorizedError('Пользователь не авторизован'));
  }

  let payload;

  try {
    payload = jwt.verify(token, 'this-is-secret-code');
  } catch (err) {
    next(new UnauthorizedError('Пользователь не авторизован'));
    return;
  }

  req.user = payload;

  next();
};

