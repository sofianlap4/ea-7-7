import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface CoursePackAttributes {
  courseId?: string;
  packId?: string;
}


export default (sequelize: Sequelize) => {
  class CoursePack
    extends Model<CoursePackAttributes>
    implements CoursePackAttributes
  {
    public courseId!: string;
    public packId!: string;
  }

  CoursePack.init(
    {
      courseId: {
        type: DataTypes.UUID,
        references: {
          model: "Courses",
          key: "id",
        },
        allowNull: false,
      },
      packId: {
        type: DataTypes.UUID,
        references: {
          model: "Packs",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CoursePack",
    }
  );

  return CoursePack;
};
