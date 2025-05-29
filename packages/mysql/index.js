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

// @fusedb/mysql
const mysql = require("mysql2/promise");

class MySQLDriver {
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
      throw new Error("MySQLDriver requires host, user, password, and database.");
    }

    this.pool = mysql.createPool({ host, user, password, database });
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

    return { ok: true, driver: "mysql", table: this.table };
  }

  async get(key) {
    const [rows] = await this.pool.query(
      `SELECT value FROM \`${this.table}\` WHERE \`key\` = ?`,
      [key]
    );

    return rows[0] ? JSON.parse(rows[0].value) : undefined;
  }

  async set(key, value) {
    await this.pool.query(
      `INSERT INTO \`${this.table}\` (\`key\`, \`value\`) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
      [key, JSON.stringify(value)]
    );
  }

  async delete(key) {
    await this.pool.query(`DELETE FROM \`${this.table}\` WHERE \`key\` = ?`, [key]);
  }

  async has(key) {
    const [rows] = await this.pool.query(
      `SELECT 1 FROM \`${this.table}\` WHERE \`key\` = ? LIMIT 1`,
      [key]
    );

    return rows.length > 0;
  }

  async clear() {
    await this.pool.query(`DELETE FROM \`${this.table}\``);
  }

  async keys() {
    const [rows] = await this.pool.query(`SELECT \`key\` FROM \`${this.table}\``);

    return rows.map(row => row.key);
  }

  async values() {
    const [rows] = await this.pool.query(`SELECT \`value\` FROM \`${this.table}\``);

    return rows.map(row => JSON.parse(row.value));
  }

  async entries() {
    const [rows] = await this.pool.query(`SELECT \`key\`, \`value\` FROM \`${this.table}\``);

    return rows.map(row => [row.key, JSON.parse(row.value)]);
  }

  async bulkSet(obj) {
    const keys = Object.keys(obj);
    const values = keys.map(k => [k, JSON.stringify(obj[k])]);

    if (values.length === 0) return;

    const placeholders = values.map(() => "(?, ?)").join(", ");
    const flatValues = values.flat();

    await this.pool.query(
      `INSERT INTO \`${this.table}\` (\`key\`, \`value\`) VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
      flatValues
    );
  }

  async bulkDelete(keys) {
    if (!keys.length) return;

    const placeholders = keys.map(() => "?").join(", ");

    await this.pool.query(
      `DELETE FROM \`${this.table}\` WHERE \`key\` IN (${placeholders})`,
      keys
    );
  }
}

module.exports = MySQLDriver;