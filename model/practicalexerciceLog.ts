import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize) => {
  class PracticalexerciceLog extends Model {}

  PracticalexerciceLog.init(
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
      exerciceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      sequelize,
      modelName: 'PracticalexerciceLog',
      timestamps: true, // enables createdAt and updatedAt
      updatedAt: false, // we only care about createdAt
    }
  );

  return PracticalexerciceLog;
};