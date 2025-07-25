import { DataTypes, Model, Sequelize } from "sequelize";

export default function defineRefreshTokenModel(sequelize: Sequelize) {
    class RefreshToken extends Model {
        public id!: number;
        public userId!: string;
        public tokenHash!: string;
        public issuedAt!: Date;
        public expiresAt!: Date;
        public device?: string;
        public userAgent?: string;
        public ip?: string;
        public revoked!: boolean;
    }

    RefreshToken.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            tokenHash: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            issuedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            device: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            userAgent: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            ip: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            revoked: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "RefreshToken",
            tableName: "refresh_tokens",
            timestamps: false,
        }
    );

    return RefreshToken;
}