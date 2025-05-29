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

// @fusedb/crypto
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * @typedef {Object} EncryptedPayload
 * @property {string} iv Initialization vector (base64)
 * @property {string} tag Authentication tag (base64)
 * @property {string} value Encrypted value (base64)
 */

/**
 * @typedef {Object} CryptoOptions
 * @property {string} key 32-byte encryption key (Buffer or base64/hex string)
 */

/**
 * Encrypt/decrypt FUSE data transparently.
 */
class CryptoMiddleware {
    /**
     * @param {CryptoOptions} options
     */
    constructor(options) {
        if (!options?.key) throw new Error("CryptoMiddleware requires an encryption key.");

        this.key = typeof options.key === "string" ? Buffer.from(options.key, "utf8") : options.key;

        if (this.key.length !== 32) throw new Error("Encryption key must be 32 bytes for AES-256.");
    }

    /**
     * Encrypt any value
     * @param {any} value
     * @returns {EncryptedPayload}
     */
    encrypt(value) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
        const serialized = JSON.stringify(value);

        let encrypted = cipher.update(serialized, "utf8");
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        const tag = cipher.getAuthTag();

        return {
            iv: iv.toString("base64"),
            tag: tag.toString("base64"),
            value: encrypted.toString("base64"),
        };
    }

    /**
     * Decrypt an EncryptedPayload
     * @param {EncryptedPayload} payload
     * @returns {any}
     */
    decrypt(payload) {
        const iv = Buffer.from(payload.iv, "base64");
        const tag = Buffer.from(payload.tag, "base64");
        const encrypted = Buffer.from(payload.value, "base64");

        const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, null, "utf8");
        decrypted += decipher.final("utf8");

        return JSON.parse(decrypted);
    }

    /** Hook: before write */
    async beforeWrite(context) {
        if (context.value !== undefined) {
            context.value = this.encrypt(context.value);
        }
    }

    /** Hook: after read */
    async afterRead(context) {
        if (context.value !== undefined && context.value?.iv && context.value?.tag && context.value?.value) {
            try {
                context.value = this.decrypt(context.value);
            } catch (err) {
                console.warn("Decryption failed:", err.message);

                context.value = undefined;
            }
        }
    }

    // Other hooks are no-ops for this middleware
    async beforeRead(_) { }
    async afterWrite(_) { }
}

module.exports = CryptoMiddleware;
