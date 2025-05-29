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

/**
 * FUSE (Fast Unified Storage Engine) core API.
 *
 * Provides:
 *  - Unified async key/value API
 *  - Default in-memory driver
 *  - Pluggable drivers via the same interface
 *  - Middleware hooks (before/after) for get/set/remove/has
 *  - Lifecycle events: connected, disconnected, error
 *  - Bulk ops, find/filter, random, snapshot import/export
 *
 * Usage:
 *   const FUSE = require('./fuse');
 *   const db = new FUSE({ driver: myDriver, middleware: [ ... ] });
 */

// @fusedb/core
const EventEmitter = require('events');

/**
 * Default in-memory driver for FUSE.
 * Implements the minimal Driver interface.
 */
class InMemoryDriver {
    constructor() {
        /** @private */
        this._data = Object.create(null);
    }

    /** @returns {Promise<{ driver: string }>} */
    async connect() {
        return { driver: 'InMemory' };
    }

    /** @returns {Promise<void>} */
    async disconnect() {
        // no-op
    }

    /** @param {string} key @returns {Promise<any>} */
    async get(key) {
        return this._data[key];
    }

    /** @param {string} key @param {any} value @returns {Promise<void>} */
    async set(key, value) {
        this._data[key] = value;
    }

    /** @param {string} key @returns {Promise<void>} */
    async remove(key) {
        delete this._data[key];
    }

    /** @param {string} key @returns {Promise<boolean>} */
    async has(key) {
        return Object.prototype.hasOwnProperty.call(this._data, key);
    }

    /** @returns {Promise<number>} */
    async size() {
        return Object.keys(this._data).length;
    }

    /** @returns {Promise<string[]>} */
    async keys() {
        return Object.keys(this._data);
    }

    /** @returns {Promise<any[]>} */
    async values() {
        return Object.keys(this._data).map(k => this._data[k]);
    }

    /** @returns {Promise<void>} */
    async clear() {
        this._data = Object.create(null);
    }

    /** @returns {Promise<string>} */
    async exportSnapshot() {
        return JSON.stringify(this._data);
    }

    /** @param {string} snapshot @returns {Promise<void>} */
    async importSnapshot(snapshot) {
        this._data = JSON.parse(snapshot);
    }
}

/**
 * @typedef {Object} Middleware
 * @property {Object} [before] - hooks before driver ops
 * @property {Function} [before.get] - async (key) => overrideValue|undefined
 * @property {Function} [before.set] - async (key, value) => newValue|undefined
 * @property {Function} [before.remove] - async (key)
 * @property {Function} [before.has] - async (key) => overrideBool|undefined
 * @property {Object} [after] - hooks after driver ops
 * @property {Function} [after.get] - async (key, value) => newValue
 * @property {Function} [after.set] - async (key, value)
 * @property {Function} [after.remove] - async (key)
 * @property {Function} [after.has] - async (key, bool) => newBool
 * @property {Function} [onError] - (err) => void
 */

/**
 * FUSE core engine.
 * @extends EventEmitter
 */
class FUSE extends EventEmitter {
    /**
     * @param {Object} [opts]
     * @param {object} [opts.driver] - Driver instance (defaults to in-memory)
     * @param {Middleware[]} [opts.middleware] - Array of middleware
     */
    constructor(opts = {}) {
        super();

        this.driver = opts.driver || new InMemoryDriver();
        this.middleware = Array.isArray(opts.middleware) ? opts.middleware : [];
        this._connected = false;
    }

    /** @returns {Promise<void>} */
    async connect() {
        try {
            const info = await this.driver.connect();

            this._connected = true;

            this.emit('connected', info);
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @returns {Promise<void>} */
    async disconnect() {
        try {
            await this.driver.disconnect();

            this._connected = false;

            this.emit('disconnected');
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /**
     * Internal error handler: calls middleware onError and emits 'error'
     * @private
     */
    _handleError(err) {
        for (const m of this.middleware) {
            if (typeof m.onError === 'function') {
                try { m.onError(err); } catch (_) { /* swallow */ }
            }
        }

        this.emit('error', err);
    }

    /** @param {string} key @returns {Promise<any>} */
    async get(key) {
        try {
            // before.get
            for (const m of this.middleware) {
                if (m.before && typeof m.before.get === 'function') {
                    const override = await m.before.get(key);

                    if (override !== undefined) {
                        // short-circuit and run after.get
                        let val = override;

                        for (const mm of this.middleware) {
                            if (mm.after && typeof mm.after.get === 'function') {
                                val = await mm.after.get(key, val);
                            }
                        }
                        return val;
                    }
                }
            }

            // driver.get
            let result = await this.driver.get(key);

            // after.get
            for (const m of this.middleware) {
                if (m.after && typeof m.after.get === 'function') {
                    result = await m.after.get(key, result);
                }
            }

            return result;
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @param {string} key @param {any} value @returns {Promise<void>} */
    async set(key, value) {
        try {
            let val = value;
            // before.set
            for (const m of this.middleware) {
                if (m.before && typeof m.before.set === 'function') {
                    const newVal = await m.before.set(key, val);

                    if (newVal !== undefined) {
                        val = newVal;
                    }
                }
            }

            // driver.set
            await this.driver.set(key, val);

            // after.set
            for (const m of this.middleware) {
                if (m.after && typeof m.after.set === 'function') {
                    await m.after.set(key, val);
                }
            }
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @param {string} key @returns {Promise<void>} */
    async remove(key) {
        try {
            // before.remove
            for (const m of this.middleware) {
                if (m.before && typeof m.before.remove === 'function') {
                    await m.before.remove(key);
                }
            }

            // driver.remove
            await this.driver.remove(key);

            // after.remove
            for (const m of this.middleware) {
                if (m.after && typeof m.after.remove === 'function') {
                    await m.after.remove(key);
                }
            }
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @param {string} key @returns {Promise<boolean>} */
    async has(key) {
        try {
            // before.has
            for (const m of this.middleware) {
                if (m.before && typeof m.before.has === 'function') {
                    const override = await m.before.has(key);

                    if (typeof override === 'boolean') {
                        return override;
                    }
                }
            }

            // driver.has
            let exists = await this.driver.has(key);

            // after.has
            for (const m of this.middleware) {
                if (m.after && typeof m.after.has === 'function') {
                    exists = await m.after.has(key, exists);
                }
            }

            return exists;
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @returns {Promise<number>} */
    async size() {
        try {
            return await this.driver.size();
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @returns {Promise<string[]>} */
    async keys() {
        try {
            return await this.driver.keys();
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @returns {Promise<any[]>} */
    async values() {
        try {
            return await this.driver.values();
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /** @returns {Promise<void>} */
    async clear() {
        try {
            return await this.driver.clear();
        } catch (err) {
            this._handleError(err);

            throw err;
        }
    }

    /**
     * Bulk set via driver or per-key set().
     * @param {Object.<string, any>} entries
     */
    async bulkSet(entries) {
        if (typeof this.driver.bulkSet === 'function') {
            try {
                return await this.driver.bulkSet(entries);
            } catch (err) {
                this._handleError(err);

                throw err;
            }
        } else {
            // fallback to individual sets
            for (const k of Object.keys(entries)) {
                await this.set(k, entries[k]);
            }
        }
    }

    /**
     * Bulk get - returns array aligned with input keys.
     * @param {string[]} keys
     * @returns {Promise<any[]>}
     */
    async bulkGet(keys) {
        return Promise.all(keys.map(k => this.get(k)));
    }

    /**
     * Bulk remove via driver or per-key remove().
     * @param {string[]} keys
     */
    async bulkRemove(keys) {
        if (typeof this.driver.bulkRemove === 'function') {
            try {
                return await this.driver.bulkRemove(keys);
            } catch (err) {
                this._handleError(err);

                throw err;
            }
        } else {
            for (const k of keys) {
                await this.remove(k);
            }
        }
    }

    /**
     * Find entries by glob-style pattern (supports * and ?).
     * @param {string} pattern
     * @returns {Promise<Object.<string, any>>}
     */
    async find(pattern) {
        const re = new RegExp(
            '^' +
            pattern.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&')
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.') +
            '$'
        );

        const result = {};

        for (const key of await this.keys()) {
            if (re.test(key)) {
                result[key] = await this.get(key);
            }
        }

        return result;
    }

    /**
     * Filter entries by predicate.
     * @param {(key: string, value: any) => boolean} fn
     * @returns {Promise<Object.<string, any>>}
     */
    async filter(fn) {
        const out = {};

        for (const key of await this.keys()) {
            const val = await this.get(key);

            if (fn(key, val)) {
                out[key] = val;
            }
        }

        return out;
    }

    /**
     * Check if any entry strictly equals value.
     * @param {any} value
     * @returns {Promise<boolean>}
     */
    async includes(value) {
        for (const val of await this.values()) {
            if (val === value) return true;
        }

        return false;
    }

    /**
     * Get one or multiple random entries.
     * @param {number} [count] - if >1, returns array; else single-object
     * @returns {Promise<Object|string[]>}
     */
    async random(count) {
        const allKeys = await this.keys();

        if (allKeys.length === 0) return count > 1 ? [] : undefined;

        const pick = (n) => {
            const chosen = new Set();

            while (chosen.size < n && chosen.size < allKeys.length) {
                const idx = Math.floor(Math.random() * allKeys.length);

                chosen.add(allKeys[idx]);
            }

            return Array.from(chosen);
        };

        if (typeof count === 'number' && count > 1) {
            const keys = pick(count);

            return Promise.all(keys.map(k => this.get(k)))
                .then(vals => keys.map((k, i) => ({ [k]: vals[i] })));
        } else {
            // single entry
            const k = allKeys[Math.floor(Math.random() * allKeys.length)];
            const val = await this.get(k);

            return { [k]: val };
        }
    }

    /**
     * Iterate over all entries in insertion order.
     * @param {(key: string, value: any) => any | Promise<any>} fn
     */
    async forEach(fn) {
        for (const key of await this.keys()) {
            const val = await this.get(key);

            await fn(key, val);
        }
    }

    /**
     * Export a JSON snapshot of the DB.
     * @returns {Promise<string>}
     */
    async exportSnapshot() {
        if (typeof this.driver.exportSnapshot === 'function') {
            return this.driver.exportSnapshot();
        }
        // fallback
        const obj = {};

        for (const k of await this.keys()) {
            obj[k] = await this.get(k);
        }

        return JSON.stringify(obj);
    }

    /**
     * Import a JSON snapshot.
     * @param {string} snapshot
     * @returns {Promise<void>}
     */
    async importSnapshot(snapshot) {
        if (typeof this.driver.importSnapshot === 'function') {
            return this.driver.importSnapshot(snapshot);
        }

        const obj = JSON.parse(snapshot);

        await this.clear();

        return this.bulkSet(obj);
    }
}

module.exports = FUSE;