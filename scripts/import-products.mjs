import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";

const root = process.cwd();
const inputFile = process.argv[2] || path.join(root, "data", "products.import.json");

function loadEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env files.
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env.production.local"));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function main() {
  const raw = fs.readFileSync(inputFile, "utf8");
  const products = JSON.parse(raw);

  if (!Array.isArray(products)) {
    throw new Error("Import file must contain a JSON array");
  }

  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      is_premium BOOLEAN NOT NULL DEFAULT FALSE,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  let inserted = 0;
  for (const product of products) {
    const {
      id,
      name,
      description = null,
      price,
      category,
      stock = 0,
      image_url = null,
      is_premium = false,
      is_available = true,
    } = product;

    if (!id || !name || !category || typeof price !== "number") {
      throw new Error(`Invalid product entry: ${JSON.stringify(product)}`);
    }

    await sql`
      INSERT INTO products (id, name, description, price, category, stock, image_url, is_premium, is_available)
      VALUES (${id}, ${name}, ${description}, ${price}, ${category}, ${stock}, ${image_url}, ${is_premium}, ${is_available})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        stock = EXCLUDED.stock,
        image_url = EXCLUDED.image_url,
        is_premium = EXCLUDED.is_premium,
        is_available = EXCLUDED.is_available
    `;

    inserted += 1;
  }

  console.log(`Imported ${inserted} products from ${inputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
