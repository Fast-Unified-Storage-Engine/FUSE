# 🔌 FUSE Driver: SQLite

> A [FUSE](https://github.com/Fast-Unified-Storage-Engine/FUSE) driver for storing data using SQLite as the storage engine.

![npm i @fushdb/sqlite](https://img.shields.io/badge/npm%20i-@fushdb/sqlite-black)
![npm](https://img.shields.io/npm/v/@fusedb/sqlite)
[![license](https://img.shields.io/npm/l/@fusedb/sqlite)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

---

## 📦 Installation

```bash
npm install @fusedb/core
npm install @fusedb/sqlite
```
---

## 🚀 Usage

```js
const FUSE = require("@fusedb/core");
const SQLiteDriver = require("@fusedb/sqlite");

const db = new FUSE({
  driver: new SQLiteDriver({
    path: "./database/data.sqlite",
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
| `path`  | `string` | *File path for the SQLite file* |

---

## ✅ Features

* ✅ Full compatibility with FUSE Core API
* ✅ Persistent storage via `SQLite`

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