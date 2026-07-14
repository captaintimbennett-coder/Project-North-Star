import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const requireFromAdapter = createRequire(import.meta.resolve("@payloadcms/db-postgres"));
const { Client } = requireFromAdapter("pg");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationDirectory = path.join(projectRoot, "src", "migrations");

function valuesFor(flag) {
  return process.argv.flatMap((value, index, args) =>
    value === flag && args[index + 1] ? [args[index + 1]] : [],
  );
}

function requiredValue(flag) {
  const [value] = valuesFor(flag);
  if (!value) throw new Error(`Missing required ${flag} argument.`);
  return value;
}

function migrationName(filename) {
  const match = filename.match(/^(\d{8}_\d{6}(?:_[a-z0-9_]+)?)\.(?:js|mjs|ts)$/i);
  return match?.[1] ?? null;
}

async function discoveredMigrationNames() {
  const entries = await readdir(migrationDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => migrationName(entry.name))
    .filter((name) => typeof name === "string")
    .sort();
}

function sameOrderedNames(actual, expected) {
  return actual.length === expected.length && actual.every((name, index) => name === expected[index]);
}

async function main() {
  const databaseURL = process.env.DATABASE_URL;
  if (!databaseURL) throw new Error("DATABASE_URL is required.");

  const expectedHost = requiredValue("--expect-host");
  const allowedPending = valuesFor("--allow");
  const execute = process.argv.includes("--execute");
  const target = new URL(databaseURL);

  if (target.hostname !== expectedHost) {
    throw new Error(`Database host guard refused ${target.hostname}; expected ${expectedHost}.`);
  }

  const discovered = await discoveredMigrationNames();
  const client = new Client({ connectionString: databaseURL });
  await client.connect();
  let applied;
  try {
    const result = await client.query("SELECT name FROM payload_migrations ORDER BY id");
    applied = new Set(result.rows.map((row) => row.name));
  } finally {
    await client.end();
  }

  const pending = discovered.filter((name) => !applied.has(name));
  console.log(`Database host: ${target.hostname}`);
  console.log(`Discovered migration files: ${discovered.length}`);
  console.log(`Pending migrations: ${pending.length ? pending.join(", ") : "none"}`);
  console.log(`Authorized pending migrations: ${allowedPending.length ? allowedPending.join(", ") : "none"}`);

  if (!sameOrderedNames(pending, allowedPending)) {
    throw new Error("Refusing migration: discovered pending migrations do not exactly match the authorized allowlist.");
  }

  if (!execute) {
    console.log("Guard passed in plan-only mode. No migration was executed.");
    return;
  }

  if (pending.length === 0) {
    throw new Error("Refusing migration execution because no migrations are pending.");
  }

  console.log("Guard passed. Starting Payload migration runner.");
  const payloadBin = path.join(projectRoot, "node_modules", "payload", "bin.js");
  const child = spawn(process.execPath, [payloadBin, "migrate"], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) throw new Error(`Payload migration runner exited with code ${exitCode}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Guarded migration failed.");
  process.exitCode = 1;
});
