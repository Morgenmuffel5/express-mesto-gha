const userRouter = require('express').Router();

const {
  getUserList,
  getUserById,
  createNewUser,
  updateUserInfo,
  changeAvatar,
} = require('../controllers/users');

userRouter.get('/', getUserList);
userRouter.get('/:userId', getUserById);
userRouter.post('/', createNewUser);
userRouter.patch('/me', updateUserInfo);
userRouter.patch('/me/avatar', changeAvatar);

module.exports = userRouter;
