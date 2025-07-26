import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class CreditTransaction extends Model { }

  CreditTransaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      packId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Packs",
          key: "id",
        },
      },
      durationMonths: {
        type: DataTypes.INTEGER,
        allowNull: true, // Only required for "purchase_pack"
        validate: { isIn: [[3, 6, 9]] },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("admin_add", "purchase_bank", "purchase_post", "purchase_d17", "purchase_pack", "bank_transfer"),
        allowNull: false,
      },
      attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending"
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CreditTransaction",
      tableName: "CreditTransactions",
      timestamps: false,
    }
  );

  return CreditTransaction;
};