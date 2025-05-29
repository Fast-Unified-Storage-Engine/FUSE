# 🧩 FUSE Middleware: Logger

> A [FUSE](https://github.com/Fast-Unified-Storage-Engine/FUSE) middleware that provides logging with support for Winston, Pino, etc.

![npm i @fushdb/logger](https://img.shields.io/badge/npm%20i-@fushdb/logger-black)
![npm](https://img.shields.io/npm/v/@fusedb/logger)
[![license](https://img.shields.io/npm/l/@fusedb/logger)](./LICENSE)
![FUSE ⚡](https://img.shields.io/badge/FUSE-⚡-yellow)

---

## 📦 Installation

```bash
npm install @fusedb/core
npm install @fusedb/logger
```

---

## 🚀 Usage

#### Console:
```js
const FUSE = require("@fusedb/core");
const JSONDriver = require("@fusedb/json");
const Logger = require("@fusedb/logger");

const db = new FUSE({
  driver: new JSONDriver({ path: "./data/db.json" }),
  middleware: [new Logger()],
});

(async () => {
  await db.set("name", "Fuse");
  await db.get("name");
})();
```

#### Winston:
```js
const FUSE = require("@fusedb/core");
const JSONDriver = require("@fusedb/json");
const Logger = require("@fusedb/logger");
const winston = require("winston");

const customLogger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

const db = new FUSE({
  driver: new JSONDriver({ path: "./data/db.json" }),
  middleware: [
    new Logger({ mode: "custom", logger: customLogger })
  ],
});

(async () => {
  await db.set("name", "Fuse");
  await db.get("name");
})();
```

---

## ⚙️ Options

| Option | Type  | Description                                   |
| ------ | ----- | --------------------------------------------- |
| `mode`  | `string` | *Set to custom or console* |
| `logger`  | `object` | *Logger instance (e.g. winston or pino)* |
| `includeValues`  | `object` | *Log full values* |

---

## ✅ Features

* ✅ Works with any FUSE driver
* ✅ Compatible with Winston, Pino, etc.

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