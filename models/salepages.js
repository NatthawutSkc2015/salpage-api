'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salepages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Salepages.hasMany(models.Bank, {
        foreignKey: 'salepage_id',
        otherKey: 'id'
      })
      
      Salepages.hasMany(models.ProductsSalepage, {
        foreignKey: 'salepage_id',
        otherKey: 'id'
      })

      Salepages.hasMany(models.Contents, {
        foreignKey: 'salepage_id',
        otherKey: 'id'
      })
  
    }
  }
  Salepages.init({
    slug: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    keywords: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    store_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Salepages',
    tableName: 'tb_salepages'
  });
  return Salepages;
};