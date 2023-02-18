const Card = require('../models/card');
const Constants = require('../utils/constants');
const NotFoundError = require('../middlewares/errors/not-found-err');
const BadRequest = require('../errors/badRequestError');
const NotFound = require('../errors/notFoundError');
const NotOwner = require('../errors/notOwenError');

const getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const createNewCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res
      .status('201')
      .send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные для создании карточки'));
      } else {
        next(err);
      }
    });
};

const deleteCard = async (req, res, next) => {
  try {
    const cardId = await Card.findOne({ _id: req.params.cardId });
    const cardOwner = req.user._id;
    if (cardId === null) {
      next(new NotFoundError(Constants.NOT_FOUND_CARD_WITH_ID));
    } else if (cardId.owner.valueOf() === cardOwner) {
      const card = await Card.findByIdAndRemove(req.params.cardId);
      res.send(card);
    } else {
      next(new NotOwner('Попытка удалить чужую карточку'));
    }
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

const setLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (card) {
      res.send(card);
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

const deleteLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (card) {
      res.send(card);
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

module.exports = {
  getAllCards,
  createNewCard,
  deleteCard,
  setLike,
  deleteLike,
};
