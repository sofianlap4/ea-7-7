import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id?: string;
  email: string;
  password: string;
  role?: "student" | "admin" | "superadmin";
  credit: number;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gouvernorat: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Verification
  emailVerificationCode?: string;
  isEmailVerified?: boolean;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "email"
  | "password"
  | "role"
  | "credit"
  | "firstName"
  | "lastName"
  | "phone"
  | "dateOfBirth"
  | "gouvernorat"
  | "createdAt"
  | "updatedAt"
  | "emailVerificationCode"
  | "isEmailVerified"
>;

export default (sequelize: Sequelize) => {
  class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public password!: string;
    public role?: "student" | "admin" | "superadmin";
    public credit!: number;
    public firstName!: string;
    public lastName!: string;
    public phone!: string;
    public dateOfBirth!: Date;
    public gouvernorat!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public emailVerificationCode?: string;
    public isEmailVerified?: boolean;
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [5, 255],
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 255],
          isStrongPassword(value: string) {
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
              throw new Error(
                "Password must contain at least 1 lowercase, 1 uppercase letter, and 1 number."
              );
            }
          },
        },
      },
      role: {
        type: DataTypes.ENUM("student", "admin", "superadmin"),
        allowNull: false,
        defaultValue: "student",
      },
      credit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "User's available credits for purchasing packs",
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^\d{8}$/,
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      gouvernorat: {
        type: DataTypes.ENUM(
          "Tunis",
          "Ariana",
          "Ben Arous",
          "Manouba",
          "Nabeul",
          "Zaghouan",
          "Bizerte",
          "Beja",
          "Jendouba",
          "Kef",
          "Siliana",
          "Sousse",
          "Monastir",
          "Mahdia",
          "Sfax",
          "Kairouan",
          "Kasserine",
          "Sidi Bouzid",
          "Gabes",
          "Mednine",
          "Tataouine",
          "Tozeur",
          "Kebili",
          "Gafsa",
          "Medenine"
        ),
        allowNull: true,
      },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      emailVerificationCode: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
