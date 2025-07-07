import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class SolutionComment extends Model {}

  SolutionComment.init(
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
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SolutionComment",
      tableName: "SolutionComments",
      timestamps: false,
    }
  );

  return SolutionComment;
};