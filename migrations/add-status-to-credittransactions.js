'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CreditTransactions', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Pour supprimer proprement l'ENUM, il faut d'abord supprimer la colonne, puis le type ENUM
    await queryInterface.removeColumn('CreditTransactions', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CreditTransactions_status";');
  },
};
