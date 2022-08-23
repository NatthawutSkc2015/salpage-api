'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Products.init({
    store_id: DataTypes.INTEGER,
    sku_id: DataTypes.STRING,
    name: DataTypes.STRING,
    detail: DataTypes.STRING,
    unit: DataTypes.STRING,
    price: DataTypes.STRING,
    status: DataTypes.STRING,
    use_stock: DataTypes.STRING,
    in_stock: DataTypes.INTEGER,
    image: DataTypes.STRING,
    noti_min_stock: DataTypes.STRING,
    cost_per_price: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Products',
    tableName: 'tb_products'
  });
  return Products;
};