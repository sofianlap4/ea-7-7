import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class QuizzQuestion extends Model {}
  QuizzQuestion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quizzId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Quizzs",
          key: "id",
        },
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Optionally, add choices if you want MCQ
      choices: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "QuizzQuestion",
      tableName: "QuizzQuestions",
      timestamps: true,
    }
  );
  return QuizzQuestion;
};