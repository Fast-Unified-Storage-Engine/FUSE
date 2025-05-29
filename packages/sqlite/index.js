/*
 * Copyright 2025 Sectly
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @fusedb/sqlite
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

class SQLiteDriver {
    /**
     * @param {Object} options
     * @param {string} options.path - Path to SQLite file (e.g., './data/db.sqlite')
     */
    constructor({ path: filePath } = {}) {
        if (!filePath) throw new Error("SQLiteDriver requires a `path` option.");

        this.filePath = path.resolve(filePath);
        this.db = null;
    }

    /**
     * Open the SQLite database and initialize the table
     */
    async connect() {
        this.db = new Database(this.filePath);
        this.db.pragma("journal_mode = WAL");
        this.db.prepare(`
      CREATE TABLE IF NOT EXISTS fuse_data (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

        return { ok: true, driver: "sqlite", file: this.filePath };
    }

    async get(key) {
        const row = this.db.prepare("SELECT value FROM fuse_data WHERE key = ?").get(key);

        return row ? JSON.parse(row.value) : undefined;
    }

    async set(key, value) {
        this.db
            .prepare("INSERT INTO fuse_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
            .run(key, JSON.stringify(value));
    }

    async delete(key) {
        this.db.prepare("DELETE FROM fuse_data WHERE key = ?").run(key);
    }

    async has(key) {
        const row = this.db.prepare("SELECT 1 FROM fuse_data WHERE key = ?").get(key);

        return !!row;
    }

    async clear() {
        this.db.prepare("DELETE FROM fuse_data").run();
    }

    async keys() {
        const rows = this.db.prepare("SELECT key FROM fuse_data").all();

        return rows.map(row => row.key);
    }

    async values() {
        const rows = this.db.prepare("SELECT value FROM fuse_data").all();

        return rows.map(row => JSON.parse(row.value));
    }

    async entries() {
        const rows = this.db.prepare("SELECT key, value FROM fuse_data").all();

        return rows.map(row => [row.key, JSON.parse(row.value)]);
    }

    async bulkSet(obj) {
        const insert = this.db.prepare(
            "INSERT INTO fuse_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
        );
        const tx = this.db.transaction((data) => {
            for (const [key, value] of Object.entries(data)) {
                insert.run(key, JSON.stringify(value));
            }
        });

        tx(obj);
    }

    async bulkDelete(keys) {
        const del = this.db.prepare("DELETE FROM fuse_data WHERE key = ?");
        const tx = this.db.transaction((keyList) => {
            for (const key of keyList) {
                del.run(key);
            }
        });

        tx(keys);
    }
}

module.exports = SQLiteDriver;