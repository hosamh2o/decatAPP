import fs from 'fs';
import postgres from 'postgres';

async function main() {
  const file = process.argv[2] || 'drizzle/0002_postgres_init.sql';
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
  try {
    console.log('Applying SQL from', file);
    // Split on semicolon followed by newline to get statements.
    const statements = sql.split(/;\n+/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      console.log('Executing statement...');
      await client.unsafe(stmt);
    }
    console.log('All statements applied.');
  } catch (err) {
    console.error('Error applying SQL:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
