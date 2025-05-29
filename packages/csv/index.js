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

// @fusedb/csv
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

class CSVDriver {
  /**
   * @param {Object} options
   * @param {string} options.path - Path to the CSV file
   * @param {boolean} [options.autosave=true] - Automatically save on set/delete
   */
  constructor({ path: filePath, autosave = true } = {}) {
    if (!filePath) throw new Error("CSVDriver requires a `path` option.");

    this.filePath = path.resolve(filePath);
    this.autosave = autosave;
    this.data = {};
  }

  /**
   * Load the CSV file from disk
   */
  async connect() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = await fs.promises.readFile(this.filePath, "utf8");
        const records = parse(raw, { columns: ["key", "value"], skip_empty_lines: true });

        for (const record of records) {
          this.data[record.key] = record.value;
        }
      } else {
        this.data = {};
      }

      return { ok: true, driver: "csv", file: this.filePath };
    } catch (err) {
      throw new Error(`Failed to read CSV file: ${err.message}`);
    }
  }

  /**
   * Save in-memory data to disk as CSV
   */
  async save() {
    const rows = Object.entries(this.data).map(([key, value]) => ({ key, value }));
    const csv = stringify(rows, { header: true });

    await fs.promises.writeFile(this.filePath, csv, "utf8");
  }

  async get(key) {
    return this.data[key];
  }

  async set(key, value) {
    this.data[key] = value;

    if (this.autosave) await this.save();
  }

  async delete(key) {
    delete this.data[key];

    if (this.autosave) await this.save();
  }

  async has(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  async clear() {
    this.data = {};

    if (this.autosave) await this.save();
  }

  async keys() {
    return Object.keys(this.data);
  }

  async values() {
    return Object.values(this.data);
  }

  async entries() {
    return Object.entries(this.data);
  }

  async bulkSet(obj) {
    for (const [key, value] of Object.entries(obj)) {
      this.data[key] = value;
    }

    if (this.autosave) await this.save();
  }

  async bulkDelete(keys) {
    for (const key of keys) {
      delete this.data[key];
    }

    if (this.autosave) await this.save();
  }
}

module.exports = CSVDriver;