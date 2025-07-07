import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface UserPackAttributes {
  id?: string;
  userId: string;
  packId: string;
  durationMonths: 3 | 6 | 9;
  price: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserPackCreationAttributes = Optional<
  UserPackAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export default (sequelize: Sequelize) => {
  class UserPack extends Model<UserPackAttributes, UserPackCreationAttributes> implements UserPackAttributes {
    public id!: string;
    public userId!: string;
    public packId!: string;
    public durationMonths!: 3 | 6 | 9;
    public price!: number;
    public startDate!: Date;
    public endDate!: Date;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  UserPack.init(
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
      packId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      durationMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { isIn: [[3, 6, 9]] },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "UserPack",
    }
  );

  return UserPack;
};