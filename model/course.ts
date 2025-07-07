import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface CourseAttributes {
  id?: string;
  title: string;
  description?: string;
  pdfUrl?: string;
  pdfOriginalName?: string;
  isFree: boolean;
  isLocked: boolean;
  creatorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CourseCreationAttributes = Optional<
  CourseAttributes,
  | "id"
  | "description"
  | "pdfUrl"
  | "pdfOriginalName"
  | "isFree"
  | "isLocked"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
>;

export default (sequelize: Sequelize) => {
  class Course
    extends Model<CourseAttributes, CourseCreationAttributes>
    implements CourseAttributes
  {
    public id!: string;
    public title!: string;
    public description?: string;
    public pdfUrl?: string;
    public pdfOriginalName?: string;
    public isFree!: boolean;
    public isLocked!: boolean;
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
      pdfUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pdfOriginalName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isFree: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
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
