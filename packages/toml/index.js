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

// @fusedb/toml
const fs = require("fs");
const path = require("path");
const { parse, stringify } = require("@iarna/toml");

class TOMLDriver {
  /**
   * @param {Object} options
   * @param {string} options.path - Path to the TOML file
   * @param {boolean} [options.autosave=true] - Automatically save on set/delete
   */
  constructor({ path: filePath, autosave = true } = {}) {
    if (!filePath) throw new Error("TOMLDriver requires a `path` option.");

    this.filePath = path.resolve(filePath);
    this.autosave = autosave;
    this.data = {};
  }

  /**
   * Load the TOML file from disk
   */
  async connect() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = await fs.promises.readFile(this.filePath, "utf8");

        this.data = parse(raw);
      } else {
        this.data = {};
      }

      return { ok: true, driver: "toml", file: this.filePath };
    } catch (err) {
      throw new Error(`Failed to read TOML file: ${err.message}`);
    }
  }

  /**
   * Save the in-memory data to disk
   */
  async save() {
    const tomlStr = stringify(this.data);

    await fs.promises.writeFile(this.filePath, tomlStr, "utf8");
  }

  /**
   * Get a value by key
   * @param {string} key
   */
  async get(key) {
    return this.data[key];
  }

  /**
   * Set a value for a key
   * @param {string} key
   * @param {any} value
   */
  async set(key, value) {
    this.data[key] = value;

    if (this.autosave) await this.save();
  }

  /**
   * Delete a key
   * @param {string} key
   */
  async delete(key) {
    delete this.data[key];

    if (this.autosave) await this.save();
  }

  /**
   * Check if a key exists
   * @param {string} key
   */
  async has(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  /**
   * Clear all data
   */
  async clear() {
    this.data = {};

    if (this.autosave) await this.save();
  }

  /**
   * Get all keys
   */
  async keys() {
    return Object.keys(this.data);
  }

  /**
   * Get all values
   */
  async values() {
    return Object.values(this.data);
  }

  /**
   * Get all entries
   */
  async entries() {
    return Object.entries(this.data);
  }

  /**
   * Bulk set multiple key-value pairs
   * @param {Object} obj
   */
  async bulkSet(obj) {
    for (const [key, value] of Object.entries(obj)) {
      this.data[key] = value;
    }

    if (this.autosave) await this.save();
  }

  /**
   * Bulk delete multiple keys
   * @param {string[]} keys
   */
  async bulkDelete(keys) {
    for (const key of keys) {
      delete this.data[key];
    }

    if (this.autosave) await this.save();
  }
}

module.exports = TOMLDriver;