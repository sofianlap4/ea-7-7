'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Rankings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      currentRank: {
        type: Sequelize.ENUM("Junior Dev", "Mid Dev", "Senior Dev", "Hacker"),
        defaultValue: "Junior Dev",
        allowNull: false,
      },
      lastPromotedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Rankings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Rankings_currentRank";');
  }
};