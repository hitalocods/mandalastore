import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const rawSql = neon(process.env.DATABASE_URL);

function isTransientDbError(error: unknown): boolean {
  const msg = String((error as Error)?.message || error || "").toLowerCase();
  return (
    msg.includes("fetch failed") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("socket") ||
    msg.includes("network") ||
    msg.includes("connection") ||
    msg.includes("timeout") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504")
  );
}

/**
 * Wrapper sobre o cliente Neon que re-tenta automaticamente até 3 vezes
 * caso o banco serverless esteja acordando (cold start) ou haja oscilação de rede.
 */
export const sql: typeof rawSql = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  if (!Array.isArray(strings) || !("raw" in strings)) {
    // Caso seja chamado como função normal sql("SELECT ...", params)
    return (rawSql as unknown as (...args: unknown[]) => Promise<unknown>)(
      strings,
      ...values
    );
  }

  return (async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await rawSql(strings, ...values);
      } catch (err) {
        lastError = err;
        if (!isTransientDbError(err) || attempt === 2) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
    throw lastError;
  })();
}) as typeof rawSql;

