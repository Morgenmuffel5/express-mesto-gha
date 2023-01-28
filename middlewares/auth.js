const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');

module.exports = (req, res, next) => {
  /* const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Пользователь не авторизован'));
  } */

  const token = req.rawHeaders.find((el) => el.match('token')) ? req.rawHeaders.find((el) => el.match('token')).replace('token=', '') : 0;

  if (token === '') {
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