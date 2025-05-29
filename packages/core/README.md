### ⚡ FUSE - Fast Unified Storage Engine

![npm i @fushdb/core](https://img.shields.io/badge/npm%20i-@fushdb/core-black)
![npm](https://img.shields.io/npm/v/@fusedb/core)
[![license](https://img.shields.io/npm/l/@fusedb/core)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

**FUSE** is a modular, high-performance database interface designed for simplicity, flexibility, and speed. It acts as a unified abstraction layer over a variety of storage drivers-from in-memory to file-based to full SQL/NoSQL backends-so your code stays consistent regardless of where your data lives.

> **⚠️ Warning:** FUSE is currently in testing phase (Here be dragons)

---

#### ✨ Key Features

* **Universal API** - A single interface for all your storage needs (JSON, SQLite, PostgreSQL, MongoDB, LocalStorage, and more).
* **Driver-based** - Plug-and-play drivers let you easily swap storage backends without changing your code.
* **Middleware Support** - Intercept, modify, or enhance data operations with powerful before/after hooks (e.g., encryption, logging, caching).
* **Lightweight & Fast** - Minimal overhead with performance-first design.
<!-- WIP: * **Cross-platform** - Works in **Node.js** and **the browser** (via compatible drivers). -->
* **Typed with JSDoc** - Clean code with full TypeScript support and auto-complete in editors.

---

### Documentation:

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Fast-Unified-Storage-Engine/FUSE)

#### 🔧 Example Usage

```js
const FUSE = require("@fusedb/core");
const JSONDriver = require("@fusedb/json");
const Crypto = require("@fusedb/crypto");

const db = new FUSE({
  driver: new JSONDriver({ path: './data/database.json' }),
  middleware: [
    new Crypto({ key: process.env.DB_KEY })
  ]
});

(async () => {
  await db.set("user:123", { name: "Alice" });
  const user = await db.get("user:123");
  console.log(user); // { name: "Alice" }
})();
```

---

#### 🔌 Official Drivers Available

* `@fusedb/json` - JSON file-backed storage driver
* `@fusedb/toml` - TOML file-backed storage driver
* `@fusedb/yaml` - YAML file-backed storage driver
* `@fusedb/csv` - CSV file-backed storage driver
* `@fusedb/sqlite` - SQLite driver
* `@fusedb/postgres` - PostgreSQL driver
* `@fusedb/mariadb` - MariaDB driver
* `@fusedb/mysql` - MySQL driver
* `@fusedb/mongodb` - MongoDB driver
<!-- WIP: * `@fusedb/indexeddb` - IndexedDB driver (browser) -->
<!-- WIP: * `@fusedb/localstorage` - LocalStorage driver (browser) -->

---

#### 🔐 Official Middleware

* `@fusedb/crypto` - AES encryption middleware
* `@fusedb/logger` - Log database events to console and/or file

---

Got it! Here's the updated **Contributing** section with that naming guidance included:

---

## 🤝 Contributing

FUSE is built to be **modular and community-driven** - we welcome contributions of all kinds!

Want to add a new driver (e.g. Redis, MySQL, IndexedDB) or create powerful middleware (like compression, caching, analytics)? You're in the right place.

---

### 🧩 What You Can Build

* **Storage Drivers** - Support any backend (SQL, NoSQL, file, browser, etc.)
* **Middleware Modules** - Add features like encryption, validation, logging, caching, and more.
* **Enhancements** - Bug fixes, performance tweaks, documentation, or new ideas.
* **Examples & Integrations** - Show off how you're using FUSE in real-world apps.

---

### 🛠️ Getting Started

1. **Fork** this repository.
2. Clone your fork:

   ```bash
   git clone https://github.com/Fast-Unified-Storage-Engine/FUSE.git
   cd FUSE
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Build your custom driver/middleware in a new folder or standalone repo.
5. Submit a Pull Request - or publish your own package!

---

### 📦 Publishing Drivers & Middleware

To keep the ecosystem consistent and easy to discover, we recommend one of these naming formats:

* **Official FUSE packages** (preferred):

  * `@fusedb/<name>`
    *Examples:* `@fusedb/json`, `@fusedb/crypto`, `@fusedb/sqlite`

* **Community/Standalone packages** (if not under `@fusedb`):

  * `fusedb-<name>`
    *Example:* `fusedb-redis`
  * `@your-org/fusedb-<name>`
    *Example:* `@acmeorg/fusedb-indexeddb`

You don't need to be part of the official org to contribute - just follow the naming pattern so others can find and use your work easily.

---

### 🙏 Thank You

Every contribution matters - whether it’s fixing bugs, improving docs, or building new modules.
FUSE is a community effort, and your creativity helps push it forward.

> Have questions or want to share ideas? Open an issue or start a discussion.

---

**FUSE** makes database logic portable, powerful, and fun to work with.
No more rewriting logic per driver. Just plug in and go.

> **Fast. Unified. Extensible. FUSE.**

# License

Licensed under the [Apache-2.0](./LICENSE).