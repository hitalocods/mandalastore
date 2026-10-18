import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não configurada.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Iniciando migração da tabela orders...");

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number SERIAL,
      customer_name TEXT NOT NULL,
      customer_whatsapp TEXT NOT NULL,
      delivery_type TEXT NOT NULL DEFAULT 'delivery',
      neighborhood_id TEXT,
      neighborhood_name TEXT,
      address TEXT,
      address_number TEXT,
      complement TEXT,
      reference TEXT,
      delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
      subtotal DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      payment_method TEXT NOT NULL,
      payment_details JSONB,
      items JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_orders_neighborhood ON orders(neighborhood_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)
  `;

  console.log("Tabela orders criada/verificada com sucesso!");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro na migração:", err);
    process.exit(1);
  });
