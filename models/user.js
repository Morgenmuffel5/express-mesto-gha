const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UnauthorizedError = require('../errors/unauthorizedError');
const BadRequest = require("../errors/badRequestError");
const CheckUserError = require("../errors/checkObjectError");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default:
      'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (linkValue) => validator.isURL(linkValue),
      message: 'Указана некорретная ссылка',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (emailValue) => validator.isEmail(emailValue),
        message: 'Указан некорретный email',
      },
    },
    password: {
      type: String,
      requiered: true,
      select: false,
    },
  },

});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((userData) => {
      if (!userData) {
        return Promise.reject(
          new UnauthorizedError('Неверный email или пароль'),
        );
      }
      return bcrypt.compare(password, userData.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new UnauthorizedError('Неверный email или пароль'),
          );
        }
        return userData;
      });
    });
};

module.exports = mongoose.model('user', userSchema);






