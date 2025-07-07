import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface ThemeAttributes {
  id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ThemeCreationAttributes = Optional<ThemeAttributes, "id" | "createdAt" | "updatedAt">;

export default (sequelize: Sequelize) => {
  class Theme extends Model<ThemeAttributes, ThemeCreationAttributes> implements ThemeAttributes {
    public id!: string;
    public title!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Theme.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Theme",
    }
  );

  return Theme;
};