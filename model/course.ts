import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface CourseAttributes {
  id?: string;
  title: string;
  description?: string;
  isOpened: boolean;
  hidden: boolean;
  creatorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CourseCreationAttributes = Optional<
  CourseAttributes,
  "id" | "description" | "isOpened" | "hidden" | "creatorId" | "createdAt" | "updatedAt"
>;

export default (sequelize: Sequelize) => {
  class Course
    extends Model<CourseAttributes, CourseCreationAttributes>
    implements CourseAttributes
  {
    public id!: string;
    public title!: string;
    public description?: string;
    public isOpened!: boolean;
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
      isOpened: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
