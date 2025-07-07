import { DataTypes, Model, Sequelize } from "sequelize";

export interface QuizzSubmissionAttributes {
  id?: string;
  userId: string;
  quizzId: string;
  success: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class QuizzSubmission extends Model<QuizzSubmissionAttributes> implements QuizzSubmissionAttributes {
    public id!: string;
    public userId!: string;
    public quizzId!: string;
    public success!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  QuizzSubmission.init(
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
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "QuizzSubmission",
      tableName: "QuizzSubmissions",
    }
  );

  return QuizzSubmission;
};