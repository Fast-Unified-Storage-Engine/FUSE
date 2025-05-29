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

// @fusedb/postgres
const { Client } = require("pg");

class PostgresDriver {
    /**
     * @param {Object} options
     * @param {string} options.connectionString - PostgreSQL connection string
     * @param {string} [options.table="fuse_data"] - Table name to use
     */
    constructor({ connectionString, table = "fuse_data" } = {}) {
        if (!connectionString) throw new Error("PostgresDriver requires a `connectionString`.");
        this.connectionString = connectionString;
        this.table = table;
        this.client = new Client({ connectionString });
    }

    async connect() {
        await this.client.connect();
        await this.client.query(`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        key TEXT PRIMARY KEY,
        value JSONB
      )
    `);
        return { ok: true, driver: "postgres", table: this.table };
    }

    async get(key) {
        const res = await this.client.query(`SELECT value FROM ${this.table} WHERE key = $1`, [key]);

        return res.rows[0]?.value;
    }

    async set(key, value) {
        await this.client.query(
            `INSERT INTO ${this.table} (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
            [key, value]
        );
    }

    async delete(key) {
        await this.client.query(`DELETE FROM ${this.table} WHERE key = $1`, [key]);
    }

    async has(key) {
        const res = await this.client.query(`SELECT 1 FROM ${this.table} WHERE key = $1`, [key]);

        return res.rowCount > 0;
    }

    async clear() {
        await this.client.query(`DELETE FROM ${this.table}`);
    }

    async keys() {
        const res = await this.client.query(`SELECT key FROM ${this.table}`);

        return res.rows.map(row => row.key);
    }

    async values() {
        const res = await this.client.query(`SELECT value FROM ${this.table}`);

        return res.rows.map(row => row.value);
    }

    async entries() {
        const res = await this.client.query(`SELECT key, value FROM ${this.table}`);

        return res.rows.map(row => [row.key, row.value]);
    }

    async bulkSet(obj) {
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        const text = `
      INSERT INTO ${this.table} (key, value)
      VALUES ${keys.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
        const params = keys.flatMap((k, i) => [k, values[i]]);

        await this.client.query(text, params);
    }

    async bulkDelete(keys) {
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

        await this.client.query(`DELETE FROM ${this.table} WHERE key IN (${placeholders})`, keys);
    }
}

module.exports = PostgresDriver;