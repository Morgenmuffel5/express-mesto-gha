const Card = require('../models/card');
const BadRequest = require('../errors/badRequestError');
const NotFound = require('../errors/notFoundError');
const NotOwner = require('../errors/notOwenError');

const getAllCards = (req, res, next) => {
  Card.find()
    .then((cardList) => res.send({ data: cardList }))
    .catch((err) => next(err));
};

const createNewCard = (req, res, next) => {
  /* const cardOwnerId = req.user._id; */
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные для создании карточки'));
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        next(new NotFound('Карточка не найдена'));
      } else if (!card.owner.equals(req.user._id)) {
        next(new NotOwner('Попытка удалить чужую карточку'));
      } else {
        card.remove().then(() => res.status(200).send({ data: card }));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const setLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ data: card });
      } else {
        next(new NotFound('Карточка с указанным _id не найдена'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные карточки'));
      } else {
        next(err);
      }
    });
};

const deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ data: card });
      } else {
        next(new NotFound('Карточка с указанным _id не найдена'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные карточки'));
      } else {
        next(err);
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
