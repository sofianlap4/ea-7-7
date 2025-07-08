import { Sequelize, DataTypes, Model } from "sequelize";

export interface UserQuizzProgressAttributes {
  id?: string;
  userId: string;
  quizzId: string;
  correctQuestions: string[]; // Array of question IDs answered correctly
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class UserQuizzProgress extends Model<UserQuizzProgressAttributes> implements UserQuizzProgressAttributes {
    public id!: string;
    public userId!: string;
    public quizzId!: string;
    public correctQuestions!: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  UserQuizzProgress.init(
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
      quizzId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      correctQuestions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "UserQuizzProgress",
      tableName: "user_quizz_progress",
    }
  );

  return UserQuizzProgress;
}