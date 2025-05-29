// Full example of FUSE

const FUSE = require("@fusedb/core");
const JSONDriver = require("@fusedb/json");
const Crypto = require("@fusedb/crypto");

const db = new FUSE({
    // Default driver is in-memory but there is support for all kinds of drivers like one for sqlite, postgresdb and localstorage and indexeddb for browsers
    driver: new JSONDriver({
        path: './data/database.json',
    }),
    middleware: [ // middleware have access to before and after read/write requests and can receive and intercept events or emit there own events
        new Crypto({ // Encrypt before saving to file and decrypt once read from file (./data/database.json)
            key: process.env.DB_KEY,
        })
    ],
});

(async () => {
  db.once('connected', info => console.log(`Connected to ${info.driver}`));
  db.on('disconnected', () => console.log('Disconnected'));
  db.on('error', err => console.error('DB Error:', err));

  await db.connect(); // (re-)connect to driver (if no driver is provided this function will default to the default built-in in-memory driver)

  // Basic CRUD
  await db.set('foo', 42);
  console.log('get foo:', await db.get('foo'));      // 42
  console.log('has foo:', await db.has('foo'));      // true
  console.log('size:', await db.size());             // 1
  console.log('keys:', await db.keys());             // ['foo']
  console.log('values:', await db.values());         // [42]

  await db.remove('foo');
  console.log('has foo after remove:', await db.has('foo')); // false

  // Bulk operations
  await db.bulkSet({ a: 1, b: 2, c: 3 });
  console.log('bulkGet [a,b,x]:', await db.bulkGet(['a','b','x'])); // [1,2,undefined]
  await db.bulkRemove(['b','c']);
  console.log('keys after bulkRemove:', await db.keys());         // ['a']

  // Find & filter
  await db.set('fizz', 'buzz');
  console.log('find("f*"):', await db.find('f*'));  // { fizz: 'buzz' }
  console.log('filter values > 1:', await db.filter((k,v) => typeof v === 'number' && v > 1)); // {}

  // Includes (value check)
  console.log('includes 1:', await db.includes(1));  // true
  console.log('includes "buzz":', await db.includes('buzz')); // true

  // Random entries
  console.log('random one:', await db.random());     // { a: 1 } or { fizz: 'buzz' }
  console.log('random two:', await db.random(2));   // up to 2 random entries

  // forEach iteration
  console.log('forEach output:');
  await db.forEach((key, value) => console.log(`${key} => ${value}`));

  // Snapshot export/import
  const snapshot = await db.exportSnapshot();
  console.log('snapshot JSON:', snapshot);

  await db.clear();
  console.log('size after clear:', await db.size()); // 0

  await db.importSnapshot(snapshot);
  console.log('size after import:', await db.size()); // back to prior count

  await db.disconnect(); // disconnect from driver (not required to do manually 99% of the time)
})()