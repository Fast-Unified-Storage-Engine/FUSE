# 🔌 FUSE Driver: Postgres

> A [FUSE](https://github.com/Fast-Unified-Storage-Engine/FUSE) driver for storing data using Postgres as the storage engine.

![npm i @fushdb/postgres](https://img.shields.io/badge/npm%20i-@fushdb/postgres-black)
![npm](https://img.shields.io/npm/v/@fusedb/postgres)
[![license](https://img.shields.io/npm/l/@fusedb/postgres)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

---

## 📦 Installation

```bash
npm install @fusedb/core
npm install @fusedb/postgres
```
---

## 🚀 Usage

```js
const FUSE = require("@fusedb/core");
const PostgresDriver = require("@fusedb/postgres");

const db = new FUSE({
  driver: new PostgresDriver({
    connectionString: "postgresql://user:password@host:port/dbname",
  }),
});

(async () => {
  await db.set("example", { hello: "world" });
  const data = await db.get("example");
  
  console.log(data); // { hello: "world" }
})();
```

---

## ⚙️ Options

| Option | Type  | Description                                 |
| ------ | ----- | ------------------------------------------- |
| `connectionString`  | `string` | *PostgreSQL connection string* |
| `table`  | `string` | *Table name for database* |

---

## ✅ Features

* ✅ Full compatibility with FUSE Core API
* ✅ Persistent storage via `Postgres`

---

## 📚 Related

* [FUSE Core](https://www.npmjs.com/package/@fusedb/core)
* [FUSE Github](https://github.com/Fast-Unified-Storage-Engine/FUSE)
* [FUSE Driver Specification](https://github.com/Fast-Unified-Storage-Engine/FUSE/blob/main/DRIVER_SPECIFICATION.md)

---

## 🤝 Contributing

We welcome community contributions!

If you’re building your own driver, feel free to publish it using:

* `fusedb-<name>`
* or `@your-org/fusedb-<name>`

Follow the [FUSE Driver Guidelines](https://github.com/fusedb/.github/blob/main/CONTRIBUTING.md) for more details.

---

## 🧾 License

Licensed under the [Apache-2.0](./LICENSE).