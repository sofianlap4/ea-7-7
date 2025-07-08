import { Sequelize, DataTypes, Model } from "sequelize";

export interface UserCourseProgressAttributes {
  id?: string;
  userId: string;
  courseId: string;
  isOpened: boolean;
  openedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class UserCourseProgress extends Model<UserCourseProgressAttributes> implements UserCourseProgressAttributes {
    public id!: string;
    public userId!: string;
    public courseId!: string;
    public isOpened!: boolean;
    public openedAt?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  UserCourseProgress.init(
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
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isOpened: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      openedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserCourseProgress",
      tableName: "user_course_progress",
      timestamps: true,
    }
  );

  return UserCourseProgress;
};