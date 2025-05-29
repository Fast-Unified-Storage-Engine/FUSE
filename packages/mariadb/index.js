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

// @fusedb/mariadb
const mariadb = require("mariadb");

class MariaDBDriver {
    /**
     * @param {Object} options
     * @param {string} options.host
     * @param {string} options.user
     * @param {string} options.password
     * @param {string} options.database
     * @param {string} [options.table="fuse_data"]
     */
    constructor({
        host,
        user,
        password,
        database,
        table = "fuse_data",
    } = {}) {
        if (!host || !user || !password || !database) {
            throw new Error("MariaDBDriver requires host, user, password, and database.");
        }

        this.pool = mariadb.createPool({ host, user, password, database, connectionLimit: 5 });
        this.table = table;
    }

    async connect() {
        const conn = await this.pool.getConnection();

        await conn.query(`
      CREATE TABLE IF NOT EXISTS \`${this.table}\` (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` TEXT
      )
    `);

        conn.release();

        return { ok: true, driver: "mariadb", table: this.table };
    }

    async get(key) {
        const conn = await this.pool.getConnection();
        const rows = await conn.query(`SELECT value FROM \`${this.table}\` WHERE \`key\` = ?`, [key]);

        conn.release();

        return rows[0] ? JSON.parse(rows[0].value) : undefined;
    }

    async set(key, value) {
        const conn = await this.pool.getConnection();

        await conn.query(`
      INSERT INTO \`${this.table}\` (\`key\`, \`value\`)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
    `, [key, JSON.stringify(value)]);

        conn.release();
    }

    async delete(key) {
        const conn = await this.pool.getConnection();

        await conn.query(`DELETE FROM \`${this.table}\` WHERE \`key\` = ?`, [key]);

        conn.release();
    }

    async has(key) {
        const conn = await this.pool.getConnection();
        const rows = await conn.query(`SELECT 1 FROM \`${this.table}\` WHERE \`key\` = ? LIMIT 1`, [key]);

        conn.release();

        return rows.length > 0;
    }

    async clear() {
        const conn = await this.pool.getConnection();

        await conn.query(`DELETE FROM \`${this.table}\``);

        conn.release();
    }

    async keys() {
        const conn = await this.pool.getConnection();
        const rows = await conn.query(`SELECT \`key\` FROM \`${this.table}\``);

        conn.release();

        return rows.map(row => row.key);
    }

    async values() {
        const conn = await this.pool.getConnection();
        const rows = await conn.query(`SELECT \`value\` FROM \`${this.table}\``);

        conn.release();

        return rows.map(row => JSON.parse(row.value));
    }

    async entries() {
        const conn = await this.pool.getConnection();
        const rows = await conn.query(`SELECT \`key\`, \`value\` FROM \`${this.table}\``);

        conn.release();

        return rows.map(row => [row.key, JSON.parse(row.value)]);
    }

    async bulkSet(obj) {
        const conn = await this.pool.getConnection();
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        const placeholders = keys.map(() => "(?, ?)").join(", ");
        const params = keys.flatMap((k, i) => [k, JSON.stringify(values[i])]);

        await conn.query(`
      INSERT INTO \`${this.table}\` (\`key\`, \`value\`)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
    `, params);

        conn.release();
    }

    async bulkDelete(keys) {
        const conn = await this.pool.getConnection();
        const placeholders = keys.map(() => "?").join(", ");

        await conn.query(`DELETE FROM \`${this.table}\` WHERE \`key\` IN (${placeholders})`, keys);

        conn.release();
    }
}

module.exports = MariaDBDriver;