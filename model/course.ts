import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface CourseAttributes {
  id?: string;
  title: string;
  description?: string;
  isLocked: boolean;
  hidden: boolean;
  creatorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CourseCreationAttributes = Optional<
  CourseAttributes,
  "id" | "description" | "isLocked" | "hidden" | "creatorId" | "createdAt" | "updatedAt"
>;

export default (sequelize: Sequelize) => {
  class Course
    extends Model<CourseAttributes, CourseCreationAttributes>
    implements CourseAttributes
  {
    public id!: string;
    public title!: string;
    public description?: string;
    public isLocked!: boolean;
    public hidden!: boolean;
    public creatorId?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Course.init(
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
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      creatorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Course",
    }
  );

  return Course;
};
