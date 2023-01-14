const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;

const ERROR_INCORRECT_INFO = 400;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

const app = express();

app.use((req, res, next) => {
  req.user = {
    _id: 'какой-то id, который я никак не могу получить',
  };

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use((req, res) => {
  res.status(ERROR_INCORRECT_INFO).send({ message: 'Ошибка 404: страница не существует' });
});

app.listen(PORT, () => {
  console.log('Приложение работает');
});
