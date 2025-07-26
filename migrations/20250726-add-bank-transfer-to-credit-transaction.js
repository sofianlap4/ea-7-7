module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('CreditTransactions', 'type', {
      type: Sequelize.ENUM('admin_add', 'purchase_bank', 'purchase_post', 'purchase_d17', 'purchase_pack', 'bank_transfer'),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('CreditTransactions', 'type', {
      type: Sequelize.ENUM('admin_add', 'purchase_bank', 'purchase_post', 'purchase_d17', 'purchase_pack'),
      allowNull: false,
    });
  },
};
