import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize) => {
  class PracticalExerciseLog extends Model {}

  PracticalExerciseLog.init(
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
      exerciseId: {
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
      modelName: 'PracticalExerciseLog',
      timestamps: true, // enables createdAt and updatedAt
      updatedAt: false, // we only care about createdAt
    }
  );

  return PracticalExerciseLog;
};