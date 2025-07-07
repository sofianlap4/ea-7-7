'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CreditTransactions', 'packId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Packs',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('CreditTransactions', 'packId');
  }
};