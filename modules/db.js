import Database from "better-sqlite3";
import { config } from "../config.js";

export const dbPath = `db/${config.name}.db`;
export const db = new Database(dbPath);

// https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");
