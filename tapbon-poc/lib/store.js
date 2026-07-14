// Tiny JSON-file store for the POC. Replaced by Drizzle/Postgres in the real build.
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "receipts.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { receipts: {}, terminals: {} }; // terminals: { [terminalId]: latestReceiptId }
  }
}

function save(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function addReceipt(receipt, terminalId = "demo") {
  const db = load();
  db.receipts[receipt.id] = receipt;
  db.terminals[terminalId] = receipt.id;
  save(db);
  return receipt;
}

export function getReceipt(id) {
  return load().receipts[id] ?? null;
}

export function latestForTerminal(terminalId) {
  return load().terminals[terminalId] ?? null;
}

export function allReceipts() {
  return Object.values(load().receipts).sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
}
