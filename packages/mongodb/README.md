# 🔌 FUSE Driver: MongoDB

> A [FUSE](https://github.com/Fast-Unified-Storage-Engine/FUSE) driver for storing data using MongoDB as the storage engine.

![npm i @fushdb/mongodb](https://img.shields.io/badge/npm%20i-@fushdb/mongodb-black)
![npm](https://img.shields.io/npm/v/@fusedb/mongodb)
[![license](https://img.shields.io/npm/l/@fusedb/mongodb)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

---

## 📦 Installation

```bash
npm install @fusedb/core
npm install @fusedb/mongodb
```
---

## 🚀 Usage

```js
const FUSE = require("@fusedb/core");
const MongoDBDriver = require("@fusedb/mongodb");

const db = new FUSE({
  driver: new MongoDBDriver({
    uri: "mongodb://localhost:27017",
    database: "fusedb",
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
| `uri`  | `string` | *MongoDB connection uri* |
| `database`  | `string` | *database name* |

---

## ✅ Features

* ✅ Full compatibility with FUSE Core API
* ✅ Persistent storage via `MongoDB`

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