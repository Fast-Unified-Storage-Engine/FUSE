# 🧩 FUSE Middleware: Crypto

> A [FUSE](https://github.com/Fast-Unified-Storage-Engine/FUSE) middleware that provides AES encryption to your data

![npm i @fushdb/json](https://img.shields.io/badge/npm%20i-@fushdb/crypto-black)
![npm](https://img.shields.io/npm/v/@fusedb/crypto)
[![license](https://img.shields.io/npm/l/@fusedb/crypto)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

---

## 📦 Installation

```bash
npm install @fusedb/core
npm install @fusedb/crypto
```

---

## 🚀 Usage

```js
const FUSE = require("@fusedb/core");
const JSONDriver = require("@fusedb/json");
const Crypto = require("@fusedb/crypto");

const db = new FUSE({
  driver: new JSONDriver({ path: "./data.json" }),
  middleware: [
    new Crypto({
      key: process.env.DB_KEY || "12345678901234567890123456789012",
    })
  ]
});
```

---

## ⚙️ Options

| Option | Type  | Description                                   |
| ------ | ----- | --------------------------------------------- |
| `key`  | `string` | *A 32 character long string for the encryption key* |

---

## ✅ Features

* ✅ Works with any FUSE driver
* ✅ Compatible with `.get()`, `.set()`, `.bulkSet()`, etc.
* ✅ AES-256-GCM encryption

---

## 📚 Related

* [FUSE Core](https://www.npmjs.com/package/@fusedb/core)
* [FUSE Github](https://github.com/Fast-Unified-Storage-Engine/FUSE)
* [Middleware API Specification](https://github.com/Fast-Unified-Storage-Engine/FUSE/blob/main/MIDDLEWARE_SPECIFICATION.md)

---

## 🤝 Contributing

Want to make your own middleware?

* Name it like: `fusedb-<name>` or `@your-org/fusedb-<name>`
* Follow the [Middleware Guidelines](https://github.com/fusedb/.github/blob/main/CONTRIBUTING.md)

Feel free to share your plugin with the community!

---

## 🧾 License

Licensed under the [Apache-2.0](./LICENSE).