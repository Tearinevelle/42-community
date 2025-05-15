import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize system data (ranks, etc.)
export const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");

    // Define system ranks for activity progression
    const systemRanks = [
      { name: "Чебоксарец", description: "Начальное звание", isSystem: true, level: 1 },
      { name: "Чебоксарец +", description: "Продвинутый начальный уровень", isSystem: true, level: 2 },
      { name: "Начинающий 42", description: "Средний уровень", isSystem: true, level: 3 },
      { name: "42-БРАТУХА", description: "Высокий уровень (мужской)", isSystem: true, level: 4, gender: "male" },
      { name: "42-СЕСТРУХА", description: "Высокий уровень (женский)", isSystem: true, level: 4, gender: "female" },
      { name: "42!", description: "Высокий уровень (другой пол)", isSystem: true, level: 4, gender: "other" },
    ];
    
    // Define special ranks that can be assigned by admins
    const specialRanks = [
      { name: "Сырок", description: "Спец. звание от администратора", isSystem: false },
      { name: "Дихлорид Оганесона", description: "Спец. звание от администратора", isSystem: false },
      { name: "Валера Вишньа", description: "Спец. звание от администратора", isSystem: false },
      { name: "Deathstroke", description: "Спец. звание от администратора", isSystem: false },
      { name: "Радиант", description: "Спец. звание от администратора", isSystem: false },
    ];

    // Check if we already have ranks
    const existingRanks = await db.select().from(schema.ranks);
    if (existingRanks.length === 0) {
      // Add system ranks
      for (const rank of systemRanks) {
        await db.insert(schema.ranks).values(rank);
        console.log(`Added system rank: ${rank.name}`);
      }
      
      // Add special ranks
      for (const rank of specialRanks) {
        await db.insert(schema.ranks).values(rank);
        console.log(`Added special rank: ${rank.name}`);
      }
    } else {
      console.log("Ranks already initialized, skipping...");
    }

    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
