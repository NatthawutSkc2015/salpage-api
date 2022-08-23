'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Orders.belongsTo(models.Salepages,{
        foreignKey: 'salepage_id',
        otherKey: 'id'
      })

      
    }
  }
  Orders.init({
    order_code: DataTypes.STRING,
    store_id: DataTypes.INTEGER,
    salepage_id: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    province_id: DataTypes.INTEGER,
    district_id: DataTypes.INTEGER,
    sub_district_id: DataTypes.INTEGER,
    zipcode: DataTypes.STRING,
    remark: DataTypes.STRING,
    status: DataTypes.STRING,
    price_total: DataTypes.DECIMAL,
    discount: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    shiping_cost: DataTypes.DECIMAL,
    slip_image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Orders',
    tableName: 'tb_orders'
  });
  return Orders;
};