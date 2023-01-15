const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 3000 } = process.env;
const app = express();

const ERROR_NOT_FOUND = 404;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '63c3b45c9464e0768bd534ad',
  };

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (req, res) => {
  res.status(ERROR_NOT_FOUND).send({ message: 'Ошибка 404: страница не существует' });
});

app.listen(PORT, () => {
  console.log('Приложение работает');
});
