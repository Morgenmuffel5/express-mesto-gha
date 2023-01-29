const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { login, createNewUser } = require('./controllers/users');
const NotFoundError = require('./errors/notFoundError');
const linkCheck = require('./constants/constants');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// роуты, которым не нужна авторизация
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(linkCheck),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createNewUser);

app.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Вы вышли из аккаунта' });
});

// роуты, которым нужна авторизация
app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.use(errors());
app.use('*', auth, (_, __, next) => next(new NotFoundError('Такой страницы не существует')));

app.use((error, req, res, next) => {
  if (error.statusCode) {
    res.status(error.statusCode).send({ message: error.message });
  } else {
    res.status(500).send({ message: 'Ошибка сервера' });
  }
  next();
});

app.listen(PORT, () => {
  console.log('Приложение работает');
});
