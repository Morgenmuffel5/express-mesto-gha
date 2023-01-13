const Card = require('../models/card');

const ERROR_INCORRECT_INFO = 400;
const ERROR_NOT_FOUND = 404;
const SERVER_ERROR = 500;

const getAllCards = (req, res) => {
  Card.find()
    .then((cardList) => res.status(200).send({ data: cardList }))
    .catch(() => res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' }));
};

const createNewCard = (req, res) => {
  const cardOwnerId = req.user._id;
  const { name, link } = req.body;

  Card.create({ name, link, cardOwnerId })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(ERROR_INCORRECT_INFO)
          .send({ message: 'Переданы некорректные данные для создании карточки' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        res.status(200).send({ data: card });
      } else {
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(ERROR_INCORRECT_INFO)
          .send({ message: 'Переданы некорректные данные карточки' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка серверва' });
    });
};

const setLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ data: card });
      } else {
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_INCORRECT_INFO).send({ message: 'Переданы некорректные данные карточки' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
      }
    });
};

const deleteLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(200).send({ data: card });
      } else {
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_INCORRECT_INFO).send({ message: 'Переданы некорректные данные карточки' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports = {
  getAllCards,
  createNewCard,
  deleteCard,
  setLike,
  deleteLike,
};
