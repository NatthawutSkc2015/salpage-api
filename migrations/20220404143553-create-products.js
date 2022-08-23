'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      store_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        references: {
          model: {
            tableName: 'tb_stores'
          },
          key: 'id'
        },
      },
      sku_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      detail: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      unit: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10,0)
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING(5)
      },
      use_stock: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      in_stock: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      image: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      noti_min_stock: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      cost_per_price: {
        allowNull: true,
        type: Sequelize.DOUBLE(10,0)
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
    await queryInterface.dropTable('tb_products');
  }
};