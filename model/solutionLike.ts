import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class SolutionLike extends Model {}

  SolutionLike.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      solutionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "RankedExerciseSolutions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SolutionLike",
      tableName: "SolutionLikes",
      timestamps: false,
    }
  );

  return SolutionLike;
};