'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderDetails.belongsTo(models.Products, {
        foreignKey: 'product_id',
        otherKey: 'id'
      })
    }
  }
  OrderDetails.init({
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    amount: DataTypes.INTEGER,
    shiping_cost: DataTypes.DECIMAL,
    price_total: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderDetails',
    tableName: 'tb_order_details'
  });
  return OrderDetails;
};