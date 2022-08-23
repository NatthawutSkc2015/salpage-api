'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bank.init({
    salepage_id: DataTypes.INTEGER,
    bank_name: DataTypes.STRING,
    account_name: DataTypes.STRING,
    account_number: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Bank',
    tableName: 'tb_bank'
  });
  return Bank;
};