# 📄 FUSE Driver Specification

This document defines the required structure and behavior for implementing a FUSE-compatible driver.

---

## 📦 Overview

FUSE drivers are adapters that handle the actual read/write operations to a chosen backend (e.g. JSON, SQLite, Redis).  
All drivers **must implement the full interface** described below, either natively or via internal wrappers.

> ✔ Drivers **MUST** implement the full public API.  
> ⚙ Drivers **MAY** internally wrap or reuse other methods (e.g. `bulkSet()` can call `set()` multiple times).  
> 🔧 Drivers **MAY** extend functionality, but must not break compatibility with FUSE Core.

---

## 🧩 Required Driver Interface

All drivers must implement a class (or function returning an object) with the following methods:

### `constructor(options: object)`

Creates the driver instance with custom config.

```js
const driver = new YourDriver({ path: "./data.json" });
````

---

### `connect(): Promise<void>`

Establish a connection or initialize the storage.
Must be called by FUSE Core during setup.

---

### `disconnect(): Promise<void>`

Gracefully close or clean up the connection.
This is called when the app shuts down or the driver is swapped.

---

### `get(key: string): Promise<any | undefined>`

Retrieve the value for a specific key.
Must return `undefined` if the key does not exist.

---

### `set(key: string, value: any): Promise<void>`

Store a value under a given key.
Must serialize appropriately if needed.

---

### `has(key: string): Promise<boolean>`

Check whether the given key exists.

---

### `delete(key: string): Promise<boolean>`

Delete the key.
Must return `true` if the key existed and was deleted, `false` otherwise.

---

### `clear(): Promise<void>`

Remove **all** keys from the current namespace or driver scope.

---

### `keys(): Promise<string[]>`

Return an array of **all stored keys**.

---

### `values(): Promise<any[]>`

Return an array of **all stored values**.

---

### `entries(): Promise<[string, any][]>`

Return an array of `[key, value]` pairs.

### `size(): Promise<number>`

Return a `number` which is the total amount of stored keys.

---

### `bulkSet(entries: [string, any][]): Promise<void>`

Set multiple key-value pairs at once.

> 💡 **Can wrap `set()`** in a loop if the backend doesn't support batch operations.

---

### `bulkGet(keys: string[]): Promise<(any | undefined)[]>`

Get multiple keys at once.

> 💡 **Can wrap `get()`** in a loop if the backend doesn't support batch operations.

---

### `bulkDelete(keys: string[]): Promise<number>`

Delete multiple keys.
Must return the number of keys successfully deleted.

> 💡 **Can wrap `delete()`** in a loop.

---

## ⚙️ Optional Methods

If supported by your backend, you may optionally implement:

* `touch(key: string): Promise<void>` - Update a key’s timestamp or access time.
* `meta(key: string): Promise<object>` - Return metadata (timestamps, version, etc.)
* `namespace(ns: string): Driver` - Return a scoped instance (e.g. sub-database)

---

## 🔬 TypeScript Interface (Reference Only)

```ts
interface FUSEDriver {
  constructor(options: object): void;

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  get(key: string): Promise<any | undefined>;
  set(key: string, value: any): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;

  clear(): Promise<void>;
  keys(): Promise<string[]>;
  values(): Promise<any[]>;
  entries(): Promise<[string, any][]>;
  size?(): Promise<number>;

  bulkSet(entries: [string, any][]): Promise<void>;
  bulkGet(keys: string[]): Promise<(any | undefined)[]>;
  bulkDelete(keys: string[]): Promise<number>;

  // Optional:
  touch?(key: string): Promise<void>;
  meta?(key: string): Promise<object>;
  namespace?(ns: string): FUSEDriver;
}
```

---

## 🧪 Testing Your Driver

To test your driver for compatibility:

1. Import your driver into a project using `@fusedb/core`
2. Run typical `.get()`, `.set()`, and `.delete()` operations
3. Try chaining bulk operations to ensure wrappers behave correctly
4. Use a test suite like `vitest` or `uvu` to ensure reliability

---

## ✅ Naming

Follow one of these conventions for publishing:

* Official: `@fusedb/<name>` → `@fusedb/sqlite`
* Community: `fusedb-<name>` → `fusedb-redis`
* Scoped: `@yourorg/fusedb-<name>` → `@acme/fusedb-mongo`

---

## 🙌 Example Drivers

* [@fusedb/json](https://www.npmjs.com/package/@fusedb/json)

---

## 💡 Tips

* Keep your driver stateless where possible.
* Handle JSON serialization internally if needed.
* Wrap errors with context to help users debug.

---

## 📬 Questions?

Open an issue or discussion on the [FUSE Repo](https://github.com/Fast-Unified-Storage-Engine/FUSE/issues).

Let’s build a better storage ecosystem - one driver at a time.