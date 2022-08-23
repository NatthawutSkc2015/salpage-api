'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ForgotPassword extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  ForgotPassword.init({
    token:     DataTypes.STRING,
    member_id: DataTypes.STRING,
    status:    DataTypes.STRING,
    exp:       DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ForgotPassword',
    tableName: 'tb_forgot_password'
  });
  return ForgotPassword;
};