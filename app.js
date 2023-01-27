const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { login, createNewUser } = require('./controllers/users');
const NotFoundError = require('./errors/notFoundError');

const { PORT = 3000 } = process.env;
const app = express();

const linkCheck = /(https?:\/\/)(w{3}\.)?([a-zA-Z0-9-]{0,63}\.)([a-zA-Z]{2,4})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]#?)?/;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});
app.use(errors());
app.use(auth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (_, __, next) => next(new NotFoundError('Такой страници не существует')));

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

app.use((error, _, res, next) => {
  if (error.statusCode) {
    res.status(error.statusCode).send({ message: error.message });
  } else {
    res.status(500).send({ message: `На сервере произошла ошибка: ${error.message}` });
  }
  next();
});

app.listen(PORT, () => {
  console.log('Приложение работает');
});
