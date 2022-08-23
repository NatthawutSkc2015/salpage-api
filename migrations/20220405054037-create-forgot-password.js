'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_forgot_password', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      member_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING(255)
      },
      exp: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tb_forgot_password');
  }
};