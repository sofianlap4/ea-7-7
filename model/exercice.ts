import { Sequelize, DataTypes, Model } from "sequelize";

export interface exerciceAttributes {
  id: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class Exercice extends Model<exerciceAttributes> implements exerciceAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Exercice.init(
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
      modelName: "Exercice",
    }
  );

  return Exercice;
};
