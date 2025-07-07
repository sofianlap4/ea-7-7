import { Sequelize, DataTypes, Model } from "sequelize";

export interface ExerciseAttributes {
  id: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class Exercise extends Model<ExerciseAttributes> implements ExerciseAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Exercise.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Exercise",
    }
  );

  return Exercise;
};
