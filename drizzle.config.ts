const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Export plain config object for drizzle-kit. Avoid using hidden helpers
// so the config can be imported without requiring specific helper exports.
export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "pg",
  dbCredentials: {
    url: connectionString,
  },
};
