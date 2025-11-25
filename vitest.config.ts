import path from "path";

// Export a plain config object to avoid importing from 'vitest/config'
// This keeps the config usable even when devDependencies (vitest) are not
// yet installed. The test runner will still pick up this object.
export default {
  root: path.resolve(import.meta.dirname),
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
  },
};
