import { Sequelize } from "sequelize";
import defineUserModel from "../model/user";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DB_URI as string, {
  logging: false,
});


const User = defineUserModel(sequelize);

async function seedUsers() {
  await sequelize.sync();

  const users = [
    {
      id: "4d3dfcba-16db-45ea-918f-9f7f574be779",
      role: "admin" as "admin",
      credit: 0,
      isEmailVerified: false,
      email: "sofiannabli1993@gmail.com",
      password: "$2b$10$N4wR.DA5NIBeu8U9bPXYceBK6bp7XNEVUjB.VYrX7rtVBXswiXo6K",
      firstName: "sofianeadmin",
      lastName: "nabli",
      phone: "20393134",
      dateOfBirth: new Date("2025-07-17"),
      gouvernorat: "Tunis",
      emailVerificationCode: "436636",
      createdAt: new Date("2025-07-07T10:18:08.402Z"),
      updatedAt: new Date("2025-07-07T10:18:08.402Z"),
      packId: null,
    },
    {
      id: "8fe7efe0-6d51-498d-a965-13e624a98bff",
      role: "student" as "student",
      credit: 0,
      isEmailVerified: false,
      email: "sofianesprit@gmail.com",
      password: "$2b$10$/fTOAF.eg35wpYr9bCt8kuT5eEkjtfuTMnQtMVhR1dJ9oTWXNEjNe",
      firstName: "sofienne",
      lastName: "student",
      phone: "20393135",
      dateOfBirth: new Date("2025-07-18"),
      gouvernorat: "Tunis",
      emailVerificationCode: "884889",
      createdAt: new Date("2025-07-07T10:19:17.188Z"),
      updatedAt: new Date("2025-07-07T10:19:17.188Z"),
      packId: null,
    },
  ];

  for (const user of users) {
    await User.upsert(user);
  }

  console.log("Users seeded!");
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});