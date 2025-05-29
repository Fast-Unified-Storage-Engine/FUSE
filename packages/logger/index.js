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

// @fusedb/logger
class LoggerMiddleware {
    /**
     * @param {Object} options
     * @param {"console" | "custom"} [options.mode="console"] - Logging mode
     * @param {Object} [options.logger] - Custom logger instance (e.g. winston or pino)
     * @param {boolean} [options.includeValues=true] - Log full values
     */
    constructor({ mode = "console", logger = null, includeValues = true } = {}) {
        this.mode = mode;
        this.logger = logger;
        this.includeValues = includeValues;
    }

    _log(level, msg, meta = {}) {
        if (this.mode === "custom" && this.logger && typeof this.logger[level] === "function") {
            this.logger[level](msg, meta);
        } else {
            const prefix = `[FUSE:${level.toUpperCase()}]`;
            const output = this.includeValues && Object.keys(meta).length > 0
                ? `${prefix} ${msg} — ${JSON.stringify(meta)}`
                : `${prefix} ${msg}`;
                
            console.log(output);
        }
    }

    async before(ctx) {
        const { op, key, value } = ctx;

        this._log("info", `Before ${op}`, { key, value });
    }

    async after(ctx, result) {
        const { op, key, value } = ctx;

        this._log("info", `After ${op}`, { key, value, result });
    }

    async on(event, ctx) {
        this._log("debug", `Event: ${event}`, ctx);
    }
}

module.exports = LoggerMiddleware;