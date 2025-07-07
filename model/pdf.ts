import { Sequelize, DataTypes, Model } from "sequelize";

export default (sequelize: Sequelize) => {
  class PDF extends Model {
    declare id: string;
    declare title: string;
    declare fileUrl: string;
    declare type: "course" | "question" | "solution";
    declare createdAt: Date;
    declare updatedAt: Date;
  }

  PDF.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("course", "question", "solution"),
        allowNull: false,
        defaultValue: "course",
      },
      // In your PDF model definition
      courseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      exerciseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Exercises",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "PDF",
    }
  );

  return PDF;
};
