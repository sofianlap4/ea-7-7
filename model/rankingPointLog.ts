import { Sequelize, DataTypes, Model } from "sequelize";

export interface RankingPointLogAttributes {
  id?: string;
  userId: string;
  rankingId: string;
  points: number;
  reason: string; // e.g. "QuizzQuestionPassed"
  context?: string; // e.g. "Quizz: JavaScript Basics"
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class RankingPointLog extends Model<RankingPointLogAttributes> implements RankingPointLogAttributes {
    public id!: string;
    public userId!: string;
    public rankingId!: string;
    public points!: number;
    public reason!: string;
    public context?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  RankingPointLog.init(
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
      rankingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      context: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "RankingPointLog",
      tableName: "ranking_point_logs",
      timestamps: true,
    }
  );

  return RankingPointLog;
};