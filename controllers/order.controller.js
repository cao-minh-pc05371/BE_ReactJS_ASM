const sequelize = require('../database');
const OrderModel = require('../models/orderModel');
const OrderDetailModel = require('../models/orderDetailModel');
const PaymentModel = require('../models/paymentModel');
const VariantModel = require('../models/productVariantsModel');
const ProductModel = require('../models/productsModel');
const SizeModel = require('../models/sizeModel');
const ColorModel = require('../models/colorModel');
const User = require('../models/usersModel');
const Address = require('../models/addressModel');

class OrderController {
  static async get(req, res) {
    try {
      const orders = await OrderModel.findAll();
      res.status(200).json({ message: 'Lấy danh sách đơn hàng thành công', data: orders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // static async getById(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const order = await OrderModel.findByPk(id, {
  //       include: [
  //         { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
  //         { model: Address, as: 'address' },
  //         {
  //           model: OrderDetailModel,
  //           as: 'details',
  //           include: [
  //             {
  //               model: VariantModel,
  //               as: 'variant',
  //               include: [
  //                 { model: ProductModel, as: 'product', attributes: ['name', 'image'] },
  //                 { model: SizeModel, as: 'size', attributes: ['size_label'] },
  //                 { model: ColorModel, as: 'color', attributes: ['color_name', 'color_code'] },
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     });

  //     if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  //     res.status(200).json({ data: order });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }

  static async getByUser(req, res) {
    const user_id = parseInt(req.params.user_id);

    if (isNaN(user_id)) {
      return res.status(400).json({ message: 'User ID không hợp lệ' });
    }

    if (user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này.' });
    }

    try {
      const orders = await OrderModel.findAll({ where: { user_id } });
      res.status(200).json({ message: 'Lấy đơn hàng của bạn thành công', data: orders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    const { user_id, address_id, note, products, payment_method, amount } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
    }
    if (!payment_method || !['COD', 'Momo'].includes(payment_method)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Số tiền thanh toán không hợp lệ' });
    }

    const transaction = await sequelize.transaction();
    try {
      const newOrder = await OrderModel.create({
        user_id,
        address_id,
        order_date: new Date(),
        status: 'pending',
        note
      }, { transaction });

      const detailsPayload = products.map(p => ({
        order_id: newOrder.id,
        variant_id: p.variant_id,
        quantity: p.quantity,
        price: p.price
      }));

      await OrderDetailModel.bulkCreate(detailsPayload, { transaction });

      const payment = await PaymentModel.create({
        order_id: newOrder.id,
        payment_date: new Date(),
        amount,
        payment_method,
        status: payment_method === 'COD' ? 'pending' : 'completed'
      }, { transaction });

      await transaction.commit();
      res.status(201).json({ message: 'Đặt hàng và thanh toán thành công', order: newOrder, payment });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Lỗi khi đặt hàng:', error);
      res.status(500).json({ message: 'Lỗi khi đặt hàng', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findByPk(id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      await order.update(req.body);
      res.status(200).json({ message: 'Cập nhật đơn hàng thành công', order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findByPk(id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      await order.destroy();
      res.status(200).json({ message: 'Xoá đơn hàng thành công' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;