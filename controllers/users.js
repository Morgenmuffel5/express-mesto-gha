const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
/* const UnauthorizedError = require('../errors/unauthorizedError'); */
const BadRequest = require('../errors/badRequestError');
const NotFound = require('../errors/notFoundError');
const CheckUserError = require('../errors/checkObjectError');

const getUserList = (req, res, next) => {
  User.find()
    .then((usersInfo) => {
      res.status(200).send(usersInfo);
    })
    .catch((err) => next(err));
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((userData) => {
      if (userData) {
        res.send({ data: userData });
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Некорректный _id пользователя'));
      } else {
        next(err);
      }
    });
};

const createNewUser = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name, about, avatar,
    }))
    .then((data) => {
      const newUser = JSON.parse(JSON.stringify(data));
      delete newUser.password;
      res.send({ data: newUser });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Неверный email или пароль'));
      } else if (err.code === 11000) {
        next(new CheckUserError('Пользователь с таким email уже есть'));
      } else {
        next(err);
      }
    });
};

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((userInfo) => res.status(200).send(userInfo))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные пользователя'));
      }
      if (err.name === 'CastError') {
        next(new NotFound('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};

const changeAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { returnDocument: 'after' })
    .then((userInfo) => res.status(200).send(userInfo))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные для обновлении аватара'));
      } else if (err.name === 'CastError') {
        next(new NotFound('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'this-is-secret-code', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Пользователь с таким логином/паролем не найден'));
      } else next(err);
    });
};

function getCurrentUser(req, res, next) {
  User.findById(req.user._id)
    .then((userData) => {
      if (userData) {
        res.send({ data: userData });
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Передан некорректный _id пользователя'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getUserList,
  getUserById,
  createNewUser,
  updateUserInfo,
  changeAvatar,
  login,
  getCurrentUser,
};
