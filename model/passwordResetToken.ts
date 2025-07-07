import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface PasswordResetTokenAttributes {
  id?: string;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type PasswordResetTokenCreationAttributes = Optional<PasswordResetTokenAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export default (sequelize: Sequelize) => {
  class PasswordResetToken extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes>
    implements PasswordResetTokenAttributes {
    public id!: string; // Using string for UUID
    public userId!: number;
    public token!: string;
    public expiresAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  PasswordResetToken.init(
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
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PasswordResetToken',
    }
  );

  return PasswordResetToken;
};