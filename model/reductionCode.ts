import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface ReductionCodeAttributes {
  id?: string;
  code: string;
  description?: string;
  percentage: number; // e.g. 20 for 20% off
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReductionCodeCreationAttributes = Optional<ReductionCodeAttributes, "id" | "description" | "createdAt" | "updatedAt">;

export default (sequelize: Sequelize) => {
  class ReductionCode extends Model<ReductionCodeAttributes, ReductionCodeCreationAttributes> implements ReductionCodeAttributes {
    public id!: string;
    public code!: string;
    public description?: string;
    public percentage!: number;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  ReductionCode.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ReductionCode",
    }
  );

  return ReductionCode;
};