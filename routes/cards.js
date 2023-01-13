const cardsRouter = require('express').Router();

const {
  getAllCards,
  createNewCard,
  deleteCard,
  setLike,
  deleteLike,
} = require('../controllers/cards');

cardsRouter.get('/cards', getAllCards);
cardsRouter.post('/cards', createNewCard);
cardsRouter.delete('/cards/:cardId', deleteCard);
cardsRouter.put('/cards/:cardId/likes', setLike);
cardsRouter.delete('/cards/:cardId/likes', deleteLike);

module.exports = cardsRouter;
