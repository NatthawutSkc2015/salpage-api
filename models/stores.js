'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stores extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Stores.init({
    store_name: DataTypes.STRING,
    slug: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Stores',
    tableName: 'tb_stores'
  });
  return Stores;
};