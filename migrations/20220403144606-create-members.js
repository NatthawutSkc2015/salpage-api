'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_members', {
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
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      modules: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      image: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      status: {
        allowNull: true,
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
    await queryInterface.dropTable('tb_members');
  }
};