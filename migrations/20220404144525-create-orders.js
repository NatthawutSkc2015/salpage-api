'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_code: {
        allowNull: false,
        type: Sequelize.STRING(50)
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
      fullname: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      province_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      district_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      sub_district_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      zipcode: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      remark: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      payment_method: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      shiping_cost: {
        allowNull: false,
        type: Sequelize.DECIMAL(10,0)
      },
      slip_image: {
        allowNull: true,
        type: Sequelize.DECIMAL(10,0)
      },
      slip_image: {
        allowNull: true,
        type: Sequelize.STRING(200)
      },
      price_total: {
        allowNull: false,
        type: Sequelize.DECIMAL(10,0)
      },
      discount: {
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
    await queryInterface.dropTable('tb_orders');
  }
};