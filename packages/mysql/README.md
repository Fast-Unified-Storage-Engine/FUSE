# 🔌 FUSE Driver: MySQL

> A [FUSE](https://github.com/Fast-Unified-Storage-Engine/FUSE) driver for storing data using MySQL as the storage engine.

![npm i @fushdb/mysql](https://img.shields.io/badge/npm%20i-@fushdb/mysql-black)
![npm](https://img.shields.io/npm/v/@fusedb/mysql)
[![license](https://img.shields.io/npm/l/@fusedb/mysql)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

---

## 📦 Installation

```bash
npm install @fusedb/core
npm install @fusedb/mysql
```
---

## 🚀 Usage

```js
const FUSE = require("@fusedb/core");
const MySQLDriver = require("@fusedb/mysql");

const db = new FUSE({
  driver: new MySQLDriver({
    host: "localhost",
    user: "root",
    password: "password",
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
| `host`  | `string` | *Host string for connection* |
| `user`  | `string` | *User string for connection* |
| `password`  | `string` | *Password string for connection* |
| `database`  | `string` | *Database string for connection* |
| `table`  | `string` | *Table name for database* |

---

## ✅ Features

* ✅ Full compatibility with FUSE Core API
* ✅ Persistent storage via `MySQL`

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