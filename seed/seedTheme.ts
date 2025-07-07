import { Sequelize } from "sequelize";
import definePackModel from "../model/pack";
import defineThemeModel from "../model/theme"; // à adapter selon ton chemin réel
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DB_URI as string, {
  logging: false,
});

const Pack = definePackModel(sequelize);
const Theme = defineThemeModel(sequelize);

// Nom exact des packs auxquels on veut associer le thème
const TARGET_PACK_NAMES = ["2ème Info", "3ème Info", "Bac Info", "Bac Scientifique"];

async function seedTheme() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Créer ou retrouver le thème
    const [theme, created] = await Theme.findOrCreate({
      where: { title: "tableau" },
    });

    console.log(`Thème ${created ? "créé" : "existant"}: ${theme.title}`);

    // Trouver les packs cibles par leur nom
    const packs = await Pack.findAll({
      where: {
        name: TARGET_PACK_NAMES,
      },
    });

    if (packs.length !== TARGET_PACK_NAMES.length) {
      throw new Error("Certains packs n'ont pas été trouvés.");
    }

    // Associer le thème aux packs (via la table intermédiaire)
    await (theme as any).setPacks(packs); // Sequelize gère PackTheme automatiquement

    console.log(`Thème associé à ${packs.length} packs avec succès.`);
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors du seed du thème :", err);
    process.exit(1);
  }
}

seedTheme();
