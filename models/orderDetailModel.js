const connection = require('../database');
const { DataTypes } = require('sequelize');

const OrderDetail = connection.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER
  },
  variant_id: {
    type: DataTypes.INTEGER
  },
  quantity: {
    type: DataTypes.INTEGER
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'order_details',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false

});

module.exports = OrderDetail;