const User = require('../models/user');

const ERROR_INCORRECT_INFO = 400;
const ERROR_NOT_FOUND = 404;
const SERVER_ERROR = 500;

const getUserList = (req, res) => {
  User.find()
    .then((usersInfo) => {
      res.status(200).send(usersInfo);
    })
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((userInfo) => {
      if (userInfo) {
        res.status(200).send(userInfo);
      } else {
        res.status(ERROR_NOT_FOUND).send({
          message: 'Пользователь с указанным id не найден',
        });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_INCORRECT_INFO).send({
          message: 'Передан некорректный _id пользователя',
        });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const createNewUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_INCORRECT_INFO).send({ message: 'Переданы некорректные данные пользователя' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((userInfo) => res.status(200).send(userInfo))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_INCORRECT_INFO).send({ message: 'Переданы некорректные данные пользователя' });
      }
      if (err.name === 'CastError') {
        res.status(ERROR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
      }
    });
};

const changeAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { returnDocument: 'after' })
    .then((userInfo) => res.status(200).send(userInfo))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_INCORRECT_INFO).send({ message: 'Переданы некорректные данные для обновлении аватара' });
      } else if (err.name === 'CastError') {
        res.status(ERROR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports = {
  getUserList,
  getUserById,
  createNewUser,
  updateUserInfo,
  changeAvatar,
};
