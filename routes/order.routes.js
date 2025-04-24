const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { checkJWT, isAdmin } = require('../middleware/authCheck');

//Admin xem toàn bộ đơn hàng
router.get('/order/list', checkJWT, isAdmin, OrderController.get);

//Người dùng xem đơn hàng của họ
router.get('/order/user/:user_id', checkJWT, OrderController.getByUser);

//Người dùng (hoặc admin) xem chi tiết đơn hàng theo ID
// router.get('/order/:id', checkJWT, OrderController.getById);

//Người dùng tạo đơn hàng mới
router.post('/order/add', checkJWT, OrderController.create);

//Admin cập nhật trạng thái đơn hàng
router.put('/order/:id', checkJWT, isAdmin, OrderController.update);

//Admin xóa đơn hàng
router.delete('/order/:id', checkJWT, isAdmin, OrderController.delete);

module.exports = router;
