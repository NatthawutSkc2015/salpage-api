'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_order_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        references: {
          model: {
            tableName: 'tb_orders'
          },
          key: 'id'
        },
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        references: {
          model: {
            tableName: 'tb_products'
          },
          key: 'id'
        },
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10,0)
      },
      amount: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      shiping_cost: {
        allowNull: true,
        type: Sequelize.DECIMAL(10,0)
      },
      price_total: {
        allowNull: false,
        type: Sequelize.DECIMAL(10,0)
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
    await queryInterface.dropTable('tb_order_details');
  }
};