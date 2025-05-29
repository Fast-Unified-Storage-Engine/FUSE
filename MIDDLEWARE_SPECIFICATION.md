# 🧩 FUSE Middleware Specification

This document defines how to create compatible middleware for the **Fast Unified Storage Engine (FUSE)**.

Middleware in FUSE is a powerful way to extend the database lifecycle - intercepting reads, writes, deletions, or events. You can use it for encryption, validation, logging, analytics, caching, and more.

---

## 📦 Overview

FUSE middleware is a class or object with specific hook methods. These hooks are invoked **before or after** certain operations in the FUSE Core.

Middleware is run in the order it is defined, and can be **async or sync**.

```js
const FUSE = require("@fusedb/core");
const JSONDriver = require("@fusedb/json");
const MyMiddleware = require("fusedb-middleware");

const db = new FUSE({
  driver: new JSONDriver({ path: "./data.json" }),
  middleware: [new MyMiddleware({ key: "secret" })]
});
````

---

## 🔌 Required Structure

A middleware **must be a class or function** that returns an object with any number of the following **optional** hooks.

```ts
interface MiddlewareHooks {
  beforeGet?(key: string): void | Promise<void>;
  afterGet?(key: string, value: any): any | Promise<any>;

  beforeSet?(key: string, value: any): [string, any] | Promise<[string, any]>;
  afterSet?(key: string, value: any): void | Promise<void>;

  beforeDelete?(key: string): string | Promise<string>;
  afterDelete?(key: string): void | Promise<void>;

  beforeBulkSet?(entries: [string, any][]): [string, any][] | Promise<[string, any][]>;
  afterBulkSet?(entries: [string, any][]): void | Promise<void>;

  beforeBulkGet?(keys: string[]): string[] | Promise<string[]>;
  afterBulkGet?(keys: string[], values: (any | undefined)[]): (any | undefined)[] | Promise<(any | undefined)[]>;

  beforeBulkDelete?(keys: string[]): string[] | Promise<string[]>;
  afterBulkDelete?(keys: string[], deleted: number): void | Promise<void>;

  onEvent?(event: string, data: any): void;
}
```

> You only need to implement the hooks you want to use.

---

## 🧪 Hook Descriptions

### Get/Set/Delete Hooks

| Hook           | When it's called                 | Purpose                      |
| -------------- | -------------------------------- | ---------------------------- |
| `beforeGet`    | Before `.get()` is executed      | Preprocess or log key access |
| `afterGet`     | After `.get()` returns           | Decrypt or modify read value |
| `beforeSet`    | Before `.set()` writes           | Encrypt or validate data     |
| `afterSet`     | After `.set()` completes         | Log or post-process data     |
| `beforeDelete` | Before `.delete()` removes a key | Validate or intercept delete |
| `afterDelete`  | After `.delete()` completes      | Log deletion or audit        |

---

### Bulk Hooks

| Hook               | When it's called       | Purpose                     |
| ------------------ | ---------------------- | --------------------------- |
| `beforeBulkSet`    | Before `.bulkSet()`    | Encrypt/validate batch data |
| `afterBulkSet`     | After `.bulkSet()`     | Post-process or log writes  |
| `beforeBulkGet`    | Before `.bulkGet()`    | Filter/prepare keys         |
| `afterBulkGet`     | After `.bulkGet()`     | Decrypt or reshape data     |
| `beforeBulkDelete` | Before `.bulkDelete()` | Filter or validate keys     |
| `afterBulkDelete`  | After `.bulkDelete()`  | Log or handle side effects  |

---

### Event Handling (optional)

You may also implement:

```ts
onEvent?(event: string, data: any): void;
```

* Called when FUSE Core emits any event (`set`, `get`, `delete`, `error`, etc.)
* Useful for analytics, metrics, or telemetry

---

## 🔁 Hook Behavior Notes

* **Hooks run in sequence**, in the order middleware is loaded.
* **Async hooks are awaited**, but you can use sync ones too.
* If a hook returns a modified value (like `afterGet`, `beforeSet`, etc.), that value will be used in place of the original.
* Middleware **should be stateless** unless necessary - store config via constructor.

---

## 🧱 Example Middleware Template

```js
class MyMiddleware {
  constructor(options = {}) {
    this.secret = options.secret;
  }

  beforeSet(key, value) {
    const encrypted = encrypt(value, this.secret);
    return [key, encrypted];
  }

  afterGet(key, value) {
    return decrypt(value, this.secret);
  }

  onEvent(event, data) {
    if (event === "set") {
      console.log("Set operation happened:", data.key);
    }
  }
}

module.exports = MyMiddleware;
```

---

## 🧪 Middleware Testing

To verify your middleware:

* Test with all core methods (`get`, `set`, `bulkSet`, etc.)
* Chain multiple middleware and confirm correct execution order
* Simulate errors and verify `onEvent("error")` or fallback behavior

---

## 🏷 Naming

We recommend:

* `@fusedb/<middleware>` → Official
* `fusedb-<middleware>` → Community
* `@your-org/fusedb-<middleware>` → Scoped

---

## 🙌 Example Middlewares

* [@fusedb/crypto](https://www.npmjs.com/package/@fusedb/crypto)

---

## 🧠 Questions?

Open a discussion or issue on the [FUSE Repo](https://github.com/Fast-Unified-Storage-Engine/FUSE/issues).

Together, we can build a powerful middleware ecosystem for FUSE!