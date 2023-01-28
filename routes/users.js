const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

/* проверка ссылки */
const linkCheck = /(https?:\/\/)(w{3}\.)?([a-zA-Z0-9-]{0,63}\.)([a-zA-Z]{2,4})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]#?)?/;

const {
  getUserList,
  getUserById,
  createNewUser,
  updateUserInfo,
  changeAvatar,
  getCurrentUser,
} = require('../controllers/users');

userRouter.get('/', getUserList);
userRouter.get('/me', getCurrentUser);

// проверка данных перед отправкой
userRouter.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserById);

userRouter.post('/', createNewUser);

// проверка данных перед отправкой
userRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserInfo);

// проверка данных перед отправкой
userRouter.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(linkCheck),
  }),
}), changeAvatar);

module.exports = userRouter;
