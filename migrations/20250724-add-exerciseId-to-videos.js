'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Videos', 'exerciseId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Exercises',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Videos', 'exerciseId');
  },
};
