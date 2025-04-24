const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cart.controller');
const { checkJWT } = require('../middleware/authCheck');

router.get('/cart/user/:user_id', checkJWT, CartController.getByUser);
router.post('/cart/add', checkJWT, CartController.add);
router.put('/cart/:id', checkJWT, CartController.update);
router.delete('/cart/:id', checkJWT, CartController.deleteCartItem);
router.delete('/cart/clear', checkJWT, CartController.clearSelected);

module.exports = router;