// model/ranking.ts
import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class Ranking extends Model {}

  Ranking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      currentRank: {
        type: DataTypes.ENUM("Junior Dev", "Mid Dev", "Senior Dev", "Hacker"),
        defaultValue: "Junior Dev",
        allowNull: false,
      },
      lastPromotedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Ranking",
      tableName: "Rankings",
      timestamps: true,
    }
  );

  return Ranking;
};