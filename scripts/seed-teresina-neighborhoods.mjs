import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env.production.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

const teresinaNeighborhoods = [
  "Acarape",
  "Aeroporto",
  "Água Mineral",
  "Alto Alegre",
  "Angelim",
  "Angélica",
  "Areias",
  "Árvores Verdes",
  "Aroeiras",
  "Beira Rio",
  "Bela Vista",
  "Bom Jesus",
  "Bom Princípio",
  "Brasilar",
  "Buenos Aires",
  "Cabral",
  "Campestre",
  "Catarina",
  "Centro (Norte)",
  "Centro (Sul)",
  "Chapadinha",
  "Cidade Industrial",
  "Cidade Jardim",
  "Cidade Nova",
  "Colorado",
  "Comprida",
  "Cristo Rei",
  "Dirceu Arcoverde",
  "Distrito Industrial",
  "Embrapa",
  "Esplanada",
  "Extrema",
  "Fátima",
  "Flor do Campo",
  "Frei Serafim",
  "Gurupi",
  "Horto",
  "Ilhotas",
  "Ininga",
  "Itaperu",
  "Itararé",
  "Jacinta Andrade",
  "Jockey",
  "Lourival Parente",
  "Livramento",
  "Macaúba",
  "Mafuá",
  "Mafrense",
  "Marquês",
  "Matadouro",
  "Matinha",
  "Memorare",
  "Mocambinho",
  "Monte Castelo",
  "Monte Verde",
  "Morada do Sol",
  "Morada Nova",
  "Morro da Esperança",
  "Morros",
  "Noivos",
  "Nossa Senhora das Graças",
  "Nova Brasília",
  "Novo Horizonte",
  "Novo Uruguai",
  "Olarias",
  "Parque Alvorada",
  "Parque Brasil",
  "Parque Ideal",
  "Parque Jacinta",
  "Parque Juliana",
  "Parque Piauí",
  "Parque Poti",
  "Parque São João",
  "Parque Sul",
  "Parque Universitário",
  "Pedra Miúda",
  "Pedra Mole",
  "Piçarra",
  "Piçarreira",
  "Pio XII",
  "Planalto",
  "Planalto Uruguai",
  "Porenquanto",
  "Porto do Centro",
  "Portal da Alegria",
  "Poti Velho",
  "Primavera",
  "Promorar",
  "Real Copagre",
  "Recanto das Palmeiras",
  "Redenção",
  "Redonda",
  "Renascença",
  "Saci",
  "Samapi",
  "Santa Cruz",
  "Santa Isabel",
  "Santa Lia",
  "Santa Luzia",
  "Santa Maria da Codipi",
  "Santa Rosa",
  "Santa Sofia",
  "Santana",
  "Santo Antônio",
  "São Cristóvão",
  "São Joaquim",
  "São João",
  "São Lourenço",
  "São Pedro",
  "São Raimundo",
  "São Sebastião",
  "Tabajaras",
  "Tabuleta",
  "Tancredo Neves",
  "Todos os Santos",
  "Três Andares",
  "Triunfo",
  "Uruguai",
  "Vale do Gavião",
  "Vale Quem Tem",
  "Verde Cap",
  "Verde Lar",
  "Vermelha",
  "Vila Operária",
  "Vila Santa Bárbara",
  "Vila São Francisco",
  "Vila Uruguai",
  "Zoobotânico",
];

const sortedUniqueNeighborhoods = Array.from(new Set(teresinaNeighborhoods)).sort((a, b) =>
  a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
);

async function main() {
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

  let insertedOrUpdated = 0;

  for (const [index, name] of sortedUniqueNeighborhoods.entries()) {
    await sql`
      INSERT INTO neighborhoods (id, name, delivery_fee, is_active, sort_order)
      VALUES (${crypto.randomUUID()}, ${name}, ${10}, ${true}, ${index + 1})
      ON CONFLICT (name) DO UPDATE
      SET
        delivery_fee = EXCLUDED.delivery_fee,
        is_active = EXCLUDED.is_active,
        sort_order = EXCLUDED.sort_order
    `;

    insertedOrUpdated += 1;
  }

  console.log(`Bairros processados: ${insertedOrUpdated}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
