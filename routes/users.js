const userRouter = require('express').Router();

const {
  getUserList,
  getUserById,
  createNewUser,
  updateUserInfo,
  changeAvatar,
} = require('../controllers/users');

userRouter.get('/users', getUserList);
userRouter.get('/users/:userId', getUserById);
userRouter.post('/users', createNewUser);
userRouter.patch('/users/me', updateUserInfo);
userRouter.patch('/users/me/avatar', changeAvatar);

module.exports = userRouter;
