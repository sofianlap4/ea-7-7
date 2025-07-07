import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface UserPackReductionAttributes {
  id?: string;
  userPackId: string;
  reductionCodeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserPackReductionCreationAttributes = Optional<UserPackReductionAttributes, "id" | "createdAt" | "updatedAt">;

export default (sequelize: Sequelize) => {
  class UserPackReduction extends Model<UserPackReductionAttributes, UserPackReductionCreationAttributes> implements UserPackReductionAttributes {
    public id!: string;
    public userPackId!: string;
    public reductionCodeId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  UserPackReduction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userPackId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reductionCodeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserPackReduction",
    }
  );

  return UserPackReduction;
};