import { Sequelize, DataTypes, Model, Optional } from "sequelize";


export interface PackAttributes {
  id?: string;
  name: string;
  description?: string;
  hidden?: boolean;
  type:  "2eme info" | "3eme info" | "Bac info" | "Bac scientifique" | "2eme info gratuit" | "3eme info gratuit" | "Bac info gratuit" | "Bac scientifique gratuit";
  freeVersion?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PackCreationAttributes = Optional<
  PackAttributes,
  "id" | "description" | "createdAt" | "updatedAt"
>;

export default (sequelize: Sequelize) => {
  class Pack extends Model<PackAttributes, PackCreationAttributes> implements PackAttributes {
    public id!: string;
    public name!: string;
    public description?: string;
    public hidden!: boolean;
    public type!: "2eme info" | "3eme info" | "Bac info" | "Bac scientifique" | "2eme info gratuit" | "3eme info gratuit" | "Bac info gratuit" | "Bac scientifique gratuit";
    public freeVersion!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Pack.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: DataTypes.ENUM( "2eme info" , "3eme info" , "Bac info" , "Bac scientifique" , "2eme info gratuit" , "3eme info gratuit" , "Bac info gratuit" , "Bac scientifique gratuit"),
        allowNull: false,
        defaultValue: "2eme info",
      },
      freeVersion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Pack",
    }
  );

  return Pack;
};
