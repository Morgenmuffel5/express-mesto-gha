const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

/* проверка ссылки */
const linkCheck = /(https?:\/\/)(w{3}\.)?([a-zA-Z0-9-]{0,63}\.)([a-zA-Z]{2,4})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]#?)?/;

const {
  getAllCards,
  createNewCard,
  deleteCard,
  setLike,
  deleteLike,
} = require('../controllers/cards');

cardsRouter.get('/', getAllCards);

cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(linkCheck),
  }),
}), createNewCard);

cardsRouter.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), deleteCard);
cardsRouter.put('/:cardId/likes', setLike);
cardsRouter.delete('/:cardId/likes', deleteLike);

module.exports = cardsRouter;
