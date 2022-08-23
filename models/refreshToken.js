'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RefreshToken.belongsTo(models.Members, {
        foreignKey: 'member_id',
        otherKey: 'id'
      })
    }
  }
  RefreshToken.init({
    token:     DataTypes.STRING,
    member_id: DataTypes.STRING,
    exp:       DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'tb_refresh_token'
  });
  return RefreshToken;
};