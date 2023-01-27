const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorizedError');
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
    .then((userInfo) => {
      if (userInfo) {
        res.status(200).send(userInfo);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

const createNewUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  return bcrypt
    .hash(password, 10)
    .then((hash) => {
      const userAlreadyCreated = User.findOne(({ email: req.body.email }));
      if (!userAlreadyCreated) {
        User.create({
          name,
          about,
          avatar,
          email,
          password: hash,
        }).then((user) => res.status(200).send({
          name: user.name,
          about: user.about,
          avatar,
          email: user.email,
        }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new BadRequest('Неверный email или пароль'));
            } else if (userAlreadyCreated) {
              next(new CheckUserError('Пользователь с таким email уже есть'));
            } else next(err);
          });
      } else {
        throw next(new CheckUserError('Пользователь с таким email уже существует'));
      }
    })
    .catch((err) => next(err));
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
      if (!user) {
        next(new UnauthorizedError('Пользователь с таким логином/паролем не найден'));
      }
      const token = jwt.sign({ _id: user._id }, 'this-is-secret-code', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Успешная авторизация' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Пользователь с таким логином/паролем не найден'));
      } else next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound('Запрашиваемый пользователь не найден');
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => next(err));
};

module.exports = {
  getUserList,
  getUserById,
  createNewUser,
  updateUserInfo,
  changeAvatar,
  login,
  getCurrentUser,
};
