# 🤝 Contributing to FUSE

Thanks for your interest in contributing to **FUSE** - the **Fast Unified Storage Engine**. We’re excited to have your support in building a truly flexible and powerful storage system for the entire JavaScript ecosystem.

---

## 📦 What Can I Contribute?

FUSE is modular by design. You can contribute in many ways:

### ✅ Drivers
Drivers connect FUSE to different storage systems like:
- Local files (JSON, SQLite, etc.)
- Databases (PostgreSQL, MongoDB, Redis, etc.)
- Browsers (IndexedDB, LocalStorage)

### ✅ Middleware
Middleware can:
- Encrypt/decrypt data
- Validate structure or types
- Log read/write activity
- Cache results
- Modify data in-flight

### ✅ Core Improvements
- Bug fixes or performance boosts
- New features in the core engine
- CLI tools or utilities

### ✅ Docs & Examples
- Improve documentation and examples
- Write guides for creating drivers or middleware
- Showcase projects that use FUSE

---

## 🧪 Setup for Development

1. **Fork the repo**
2. Clone your fork:
   ```bash
   git clone https://github.com/Fast-Unified-Storage-Engine/FUSE.git
   cd FUSE
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Run tests**

   ```bash
   npm test
   ```

---

## 🧩 Creating Drivers or Middleware

You can contribute to this repo or publish your package independently.
Use one of the following naming formats:

### 📛 Naming Guidelines

| Type      | Recommended Format        | Example                   |
| --------- | ------------------------- | ------------------------- |
| Official  | `@fusedb/<name>`          | `@fusedb/sqlite`          |
| Community | `fusedb-<name>`           | `fusedb-redis`            |
| Scoped    | `@your-org/fusedb-<name>` | `@myorg/fusedb-indexeddb` |

> You don’t need to be part of the `@fusedb` org to contribute. Just follow the naming pattern so others can find your module easily.

---

## 📝 Commit Conventions

We use conventional commit messages to automate changelogs and releases:

```
feat: add redis driver
fix: resolve JSON middleware crash
docs: improve README and examples
```

---

## 🚀 Submitting a Pull Request

1. Create a branch from `main`
2. Make your changes
3. Add or update tests if needed
4. Commit with a descriptive message
5. Push and open a Pull Request

> Include context and reasoning in your PR so we can give it the best review possible!

---

## 🙏 Code of Conduct

By contributing, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🗨️ Questions? Ideas?

* Open an issue
* Start a GitHub Discussion
* Tag us on social media
* Or just say hi - we're friendly!

---

Thank you for being part of the FUSE community ❤️
Together, we can unify how developers handle data - one driver at a time.