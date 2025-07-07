'use strict';

// Example migration: add-offerId-to-userpack.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("UserPacks", "offerId", {
      type: Sequelize.UUID,
      references: {
        model: "PackOffers",
        key: "id",
      },
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("UserPacks", "offerId");
  },
};