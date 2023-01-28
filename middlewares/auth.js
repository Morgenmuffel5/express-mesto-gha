const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError');

module.exports = (req, res, next) => {
  // этот способ распарсить токен не работает, не понимаю почему, в теории указано, что именно так он и должен парситься
  // /*  const token = req.cookie.jwt; */

  const token = req.rawHeaders.find((el) => el.match('jwt')) ? req.rawHeaders.find((el) => el.match('jwt')).replace('jwt=', '') : '';
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
