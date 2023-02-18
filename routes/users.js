const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const linkCheck = require('../constants/constants');

const {
  getUserList,
  getUserById,
  updateUserInfo,
  changeAvatar,
  getCurrentUser,
} = require('../controllers/users');

userRouter.get('/me', getCurrentUser);
userRouter.get('/', getUserList);

// проверка данных перед отправкой
userRouter.get('/:userId', celebrate({
    params: Joi.object().keys({
      userId: Joi.string().length(24).hex().required(),
    }),
  }),
  getUserById,
);

userRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserInfo);

userRouter.patch('/me/avatar',  celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(linkCheck),
  }),
}), changeAvatar);

module.exports = userRouter;
