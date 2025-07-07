import { Sequelize, DataTypes, Model } from 'sequelize';

interface TestCase {
  input: string;
  expectedOutput: string;
}

export default (sequelize: Sequelize) => {
  class PracticalExercise extends Model {
    declare id: string;
    declare title: string;
    declare description: string;
    declare difficulty: 'easy' | 'medium' | 'hard';
    declare language: 'python' | 'javascript' | 'sql';
    declare starterCode: string;
    declare solution: string;
    declare testCases: TestCase[];
    declare isFree: boolean;
    declare hidden: boolean;
  }

  PracticalExercise.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        allowNull: false
      },
      language: {
        type: DataTypes.ENUM('python', 'javascript', 'sql'),
        allowNull: false
      },
      starterCode: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      solution: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      testCases: {
        type: DataTypes.JSONB, // Using JSONB for PostgreSQL
        allowNull: false,
        defaultValue: []
      },
      isFree: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'PracticalExercise'
    }
  );

  return PracticalExercise;
};