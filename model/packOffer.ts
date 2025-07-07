import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface PackOfferAttributes {
  id?: string;
  packId: string;
  durationMonths: 3 | 6 | 9;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PackOfferCreationAttributes = Optional<PackOfferAttributes, "id" | "createdAt" | "updatedAt">;

export default (sequelize: Sequelize) => {
  class PackOffer extends Model<PackOfferAttributes, PackOfferCreationAttributes> implements PackOfferAttributes {
    public id!: string;
    public packId!: string;
    public durationMonths!: 3 | 6 | 9;
    public price!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  PackOffer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    },
    {
      sequelize,
      modelName: "PackOffer",
    }
  );

  return PackOffer;
};