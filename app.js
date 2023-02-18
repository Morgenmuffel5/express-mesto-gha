require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const cors = require('./middlewares/cors');
const { login, createNewUser} = require('./controllers/users');
const auth = require('./middlewares/auth');
const linkCheck = require('./constants/constants');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notFoundError');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

app.use(cors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

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

app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', auth, (_, __, next) => next(new NotFoundError('Такой страницы не существует')));

app.use(errorLogger);

app.use(errors());
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
