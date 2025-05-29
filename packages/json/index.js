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

// @fusedb/json
const fs = require("fs");
const path = require("path");

/**
 * @typedef {Object} JSONDriverOptions
 * @property {string} path Path to the JSON file
 * @property {boolean} [autosave=true] Automatically save after write
 */

/**
 * @implements {import("@fusedb/core").DriverInterface}
 */
class JSONDriver {
    /**
     * @param {JSONDriverOptions} options
     */
    constructor(options) {
        if (!options || typeof options.path !== "string") {
            throw new Error("Missing or invalid 'path' option for JSONDriver.");
        }

        this.filePath = path.resolve(options.path);
        this.autosave = options.autosave !== false;
        this.data = {};

        if (fs.existsSync(this.filePath)) {
            try {
                const raw = fs.readFileSync(this.filePath, "utf8");

                this.data = JSON.parse(raw);
            } catch (err) {
                console.warn(`Failed to load JSON file: ${err.message}`);

                this.data = {};
            }
        } else {
            this._save(); // create empty file
        }
    }

    _save() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
    }

    _auto() {
        if (this.autosave) this._save();
    }

    async get(key) {
        return this.data[key];
    }

    async set(key, value) {
        this.data[key] = value;

        this._auto();
    }

    async delete(key) {
        const existed = key in this.data;

        delete this.data[key];

        this._auto();

        return existed;
    }

    async has(key) {
        return key in this.data;
    }

    async clear() {
        this.data = {};

        this._auto();
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

    async all() {
        return { ...this.data };
    }

    async bulkSet(entries) {
        for (const [key, value] of entries) {
            this.data[key] = value;
        }

        this._auto();
    }

    async bulkGet(keys) {
        return keys.map(key => this.data[key]);
    }

    async bulkDelete(keys) {
        for (const key of keys) {
            delete this.data[key];
        }

        this._auto();
    }
}

module.exports = JSONDriver;