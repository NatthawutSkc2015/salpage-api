'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_bank', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      salepage_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        references: {
          model: {
            tableName: 'tb_salepages'
          },
          key: 'id'
        },
      },
      bank_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      account_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      account_number: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      image: {
        allowNull: false,
        type: Sequelize.STRING(255)
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
    await queryInterface.dropTable('tb_bank');
  }
};