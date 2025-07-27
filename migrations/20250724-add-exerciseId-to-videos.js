'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Videos', 'exerciceId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'exercices',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Videos', 'exerciceId');
  },
};
