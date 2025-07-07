import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class LiveSessionLog extends Model {}

  LiveSessionLog.init(
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
      liveSessionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "LiveSessionLog",
      tableName: "LiveSessionLogs",
      timestamps: true,
    }
  );

  return LiveSessionLog;
};