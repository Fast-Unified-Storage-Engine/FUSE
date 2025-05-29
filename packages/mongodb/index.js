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

// @fusedb/mongodb
const { MongoClient } = require("mongodb");

class MongoDBDriver {
    /**
     * @param {Object} options
     * @param {string} options.uri - MongoDB connection URI
     * @param {string} options.database - Database name
     * @param {string} [options.collection="fuse_data"] - Collection name
     */
    constructor({ uri, database, collection = "fuse_data" } = {}) {
        if (!uri || !database) throw new Error("MongoDBDriver requires `uri` and `database`.");
        this.uri = uri;
        this.dbName = database;
        this.collectionName = collection;
        this.client = new MongoClient(this.uri);
    }

    async connect() {
        await this.client.connect();

        this.db = this.client.db(this.dbName);
        this.col = this.db.collection(this.collectionName);

        // Create _id index (if it doesn't exist)
        await this.col.createIndex({ _id: 1 }, { unique: true });

        return { ok: true, driver: "mongodb", collection: this.collectionName };
    }

    async get(key) {
        const doc = await this.col.findOne({ _id: key });

        return doc?.value;
    }

    async set(key, value) {
        await this.col.updateOne(
            { _id: key },
            { $set: { value } },
            { upsert: true }
        );
    }

    async delete(key) {
        await this.col.deleteOne({ _id: key });
    }

    async has(key) {
        const doc = await this.col.findOne({ _id: key }, { projection: { _id: 1 } });

        return !!doc;
    }

    async clear() {
        await this.col.deleteMany({});
    }

    async keys() {
        const docs = await this.col.find({}, { projection: { _id: 1 } }).toArray();

        return docs.map(d => d._id);
    }

    async values() {
        const docs = await this.col.find({}, { projection: { value: 1 } }).toArray();

        return docs.map(d => d.value);
    }

    async entries() {
        const docs = await this.col.find({}).toArray();

        return docs.map(d => [d._id, d.value]);
    }

    async bulkSet(obj) {
        const ops = Object.entries(obj).map(([key, value]) => ({
            updateOne: {
                filter: { _id: key },
                update: { $set: { value } },
                upsert: true,
            },
        }));

        await this.col.bulkWrite(ops);
    }

    async bulkDelete(keys) {
        await this.col.deleteMany({ _id: { $in: keys } });
    }
}

module.exports = MongoDBDriver;