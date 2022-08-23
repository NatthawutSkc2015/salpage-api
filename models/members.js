'use strict';
const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Members.belongsTo(models.Stores,{
        foreignKey: 'store_id',
        otherKey: 'id'
      })
    }
  }
  Members.init({
    store_id: DataTypes.INTEGER,
    phone:    DataTypes.STRING,
    email:    DataTypes.STRING,
    password: DataTypes.STRING,
    modules:  DataTypes.STRING,
    image:    DataTypes.STRING,
    status:   DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Members',
    tableName: 'tb_members',
    hooks: {
      beforeCreate : function(user, options){
        //Hash password
        const hashed_password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        user.password = hashed_password
      },
      beforeValidate: (user, options) => {
        if(options){
          if(user.password){
            const hashed_password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
            user.password = hashed_password
          }
        }
      },
    }
  });

  //Validate Password
  Members.prototype.isValidatePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
  }


  return Members;
};