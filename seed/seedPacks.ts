import { Sequelize } from "sequelize";
import definePackModel from "../model/pack";
import dotenv from "dotenv";
dotenv.config();

// Adjust the path above as needed for your project structure

const sequelize = new Sequelize(process.env.DB_URI as string, {
  logging: false,
});

const Pack = definePackModel(sequelize);

type PackType =
  | "2eme info gratuit"
  | "3eme info gratuit"
  | "Bac info gratuit"
  | "Bac scientifique gratuit"
  | "2eme info"
  | "3eme info"
  | "Bac info"
  | "Bac scientifique";

interface SeedPack {
  name: string;
  type: PackType;
  description: string;
  freeVersion: boolean;
}

const PACKS: SeedPack[] = [
  {
    name: "2ème Info Gratuit",
    type: "2eme info gratuit",
    description: "Pack gratuit pour les élèves de 2ème année info.",
    freeVersion: true,
  },
  {
    name: "3ème Info Gratuit",
    type: "3eme info gratuit",
    description: "Pack gratuit pour les élèves de 3ème année info.",
    freeVersion: true,
  },
  {
    name: "Bac Info Gratuit",
    type: "Bac info gratuit",
    description: "Pack gratuit pour les élèves Bac info.",
    freeVersion: true,
  },
  {
    name: "Bac Scientifique Gratuit",
    type: "Bac scientifique gratuit",
    description: "Pack gratuit pour les élèves Bac scientifique.",
    freeVersion: true,
  },
  {
    name: "2ème Info",
    type: "2eme info",
    description: "Pack premium pour les élèves de 2ème année info.",
    freeVersion: false,
  },
  {
    name: "3ème Info",
    type: "3eme info",
    description: "Pack premium pour les élèves de 3ème année info.",
    freeVersion: false,
  },
  {
    name: "Bac Info",
    type: "Bac info",
    description: "Pack premium pour les élèves Bac info.",
    freeVersion: false,
  },
  {
    name: "Bac Scientifique",
    type: "Bac scientifique",
    description: "Pack premium pour les élèves Bac scientifique.",
    freeVersion: false,
  },
];

async function seedPacks() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    for (const pack of PACKS) {
      await Pack.findOrCreate({
        where: { type: pack.type },
        defaults: pack,
      });
    }

    console.log("Pack types seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding packs:", err);
    process.exit(1);
  }
}

seedPacks();