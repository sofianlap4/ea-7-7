import { DataTypes, Model, Sequelize, Optional } from "sequelize";

export interface LiveSessionAttributes {
  id?: string;
  title: string;
  description: string;
  date: Date;
  meetLink: string;
  createdBy: string;
  packId: string; // <-- Add this line
  createdAt?: Date;
  updatedAt?: Date;
}

export type LiveSessionCreationAttributes = Optional<LiveSessionAttributes, "id" | "createdAt" | "updatedAt">;

export default (sequelize: Sequelize) => {
  class LiveSession extends Model<LiveSessionAttributes, LiveSessionCreationAttributes>
    implements LiveSessionAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public date!: Date;
    public meetLink!: string;
    public createdBy!: string;
    public packId!: string; // <-- Add this line
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  LiveSession.init(
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
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      meetLink: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      packId: { // <-- Add this block
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Packs",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "LiveSession",
      tableName: "LiveSessions",
      timestamps: true,
    }
  );

  return LiveSession;
};