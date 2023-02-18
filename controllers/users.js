const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../errors/badRequestError');
const NotFound = require('../errors/notFoundError');
const CheckUserError = require('../errors/checkObjectError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUserList = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
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

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

const createNewUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((userdata) => res
      .status('201').send({
        name: userdata.name,
        about: userdata.about,
        avatar: userdata.avatar,
        email: userdata.email,
        _id: userdata._id,
      }))
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
  const {name, about} = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {name, about},
    {
      new: true,
      runValidators: true
    },
  )
    .then((user) => {
      if (user) {
        res.send({data: user});
      } else {
        next(new NotFound('Пользователь с указанным _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные пользователя'));
      }
      if (err.name === 'CastError') {
        next(new BadRequest('Передан некорректный id пользователя'));
      } else {
        next(err);
      }
    })
}

  const changeAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true,
      runValidators: true },
  )
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        next(new NotFound('Пользователь с указанным _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные для обновлении аватара'));
      } else if (err.name === 'CastError') {
        next(new BadRequest('Передан некорректный id пользователя'));
      } else {
        next(err);
      }
    });
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
