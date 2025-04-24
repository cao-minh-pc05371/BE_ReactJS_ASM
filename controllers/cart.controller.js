const CartModel = require('../models/cartModel');
const VariantModel = require('../models/productVariantsModel');
const ProductModel = require('../models/productsModel');
const SizeModel = require('../models/sizeModel');
const ColorModel = require('../models/colorModel');
const { Op } = require('sequelize');

class CartController {
  static response(res, status, message, data = {}) {
    return res.status(status).json({ message, ...data });
  }

  static async getByUser(req, res) {
    try {
      const { user_id } = req.params;

      const cartItems = await CartModel.findAll({
        where: { user_id },
        include: [
          {
            model: VariantModel,
            as: 'variant',
            include: [
              {
                model: ProductModel,
                as: 'product',
                attributes: ['id', 'name', 'image', 'price', 'sale_price']
              },
              {
                model: SizeModel,
                as: 'size',
                attributes: ['id', 'size_label']
              },
              {
                model: ColorModel,
                as: 'color',
                attributes: ['id', 'color_name', 'color_code']
              }
            ]
          }
        ]
      });

      const mapped = cartItems.map((item) => {
        return {
          id: item.id,
          quantity: item.quantity,
          productId: item.variant.product.id,
          name: item.variant.product.name,
          image: item.variant.product.image,
          price: item.variant.product.price,
          sale_price: item.variant.product.sale_price,
          size: item.variant.size?.size_label,
          color: item.variant.color?.color_name,
          color_code: item.variant.color?.color_code,
          variant_id: item.variant.id
        };
      });

      return res.status(200).json({
        message: 'Lấy giỏ hàng thành công',
        data: mapped
      });
    } catch (error) {
      console.error(" [getByUser] Lỗi:", error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  static async add(req, res) {
    try {
      const user_id = req.user?.id;
      const { variant_id, quantity } = req.body;

      // Kiểm tra xác thực
      if (!user_id) return res.status(401).json({ message: "Token không hợp lệ hoặc thiếu middleware" });

      // Kiểm tra đầu vào
      if (!variant_id) return res.status(400).json({ message: "Thiếu variant_id" });
      if (!Number.isInteger(quantity) || quantity <= 0)
        return res.status(400).json({ message: "Số lượng phải là số nguyên dương" });

      // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
      const existingItem = await CartModel.findOne({ where: { user_id, variant_id } });

      if (existingItem) {
        // Nếu có => cộng dồn số lượng
        existingItem.quantity += quantity;
        await existingItem.save();
        return res.status(200).json({
          message: "✅ Đã cập nhật số lượng trong giỏ hàng",
          item: existingItem
        });
      }

      // Nếu chưa có => tạo mới dòng giỏ hàng
      const newItem = await CartModel.create({ user_id, variant_id, quantity });
      return res.status(201).json({
        message: "✅ Đã thêm sản phẩm vào giỏ hàng",
        item: newItem
      });
    } catch (error) {
      console.error(" [Cart Add] Lỗi server:", error);
      return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const item = await CartModel.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: 'Không tìm thấy mục trong giỏ' });
      }

      item.quantity = quantity;
      await item.save();
      return res.status(200).json({ message: 'Cập nhật số lượng thành công', item });
    } catch (error) {
      console.error(" [update] Lỗi:", error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  static async deleteCartItem(req, res) {
    try {
      const { id } = req.params;
      const item = await CartModel.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: 'Không tìm thấy mục trong giỏ' });
      }

      await item.destroy();
      return res.status(200).json({ message: 'Xoá sản phẩm khỏi giỏ hàng thành công' });
    } catch (error) {
      console.error(" [delete] Lỗi:", error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  static async clearSelected(req, res) {
    try {
      const { user_id, cart_ids } = req.body;

      if (!user_id || !Array.isArray(cart_ids)) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
      }

      const deleted = await CartModel.destroy({
        where: {
          id: { [Op.in]: cart_ids },
          user_id
        }
      });

      return res.status(200).json({
        message: `Đã xoá ${deleted} sản phẩm khỏi giỏ hàng`
      });
    } catch (error) {
      console.error(" [clearSelected] Lỗi:", error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

}

module.exports = CartController;
