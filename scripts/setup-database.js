import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  console.log("Setting up database schema...");

  try {
    // Criar tabela de bairros
    await sql`
      CREATE TABLE IF NOT EXISTS neighborhoods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_neighborhoods_sort_order ON neighborhoods(sort_order ASC)
    `;

    console.log("✅ Database schema setup completed successfully!");
    console.log("✅ Neighborhoods table created!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();
