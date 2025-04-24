const Order = require('./orderModel');
const OrderDetail = require('./orderDetailModel');
const ProductVariant = require('./productVariantsModel');
const Product = require('./productsModel');
const Size = require('./sizeModel');
const Color = require('./colorModel');
const User = require('./usersModel');
const Address = require('./addressModel');

// Order -> User + Address + Details
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details' });

// OrderDetail -> Variant
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderDetail.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Variant -> Product + Size + Color
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductVariant.belongsTo(Size, { foreignKey: 'size_id', as: 'size' });
ProductVariant.belongsTo(Color, { foreignKey: 'color_id', as: 'color' });