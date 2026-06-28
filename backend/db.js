const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function safeParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function normalizeRow(row) {
  if (!row) return row;
  return {
    ...row,
    headers: safeParse(row.headers, []),
    query: safeParse(row.query, []),
    auth: safeParse(row.auth, { type: 'none' }),
    variables: safeParse(row.variables, []),
  };
}

async function initialize() {
  await run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY,
    collectionId INTEGER,
    name TEXT NOT NULL,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    headers TEXT DEFAULT '[]',
    query TEXT DEFAULT '[]',
    bodyType TEXT DEFAULT 'raw',
    body TEXT DEFAULT '',
    auth TEXT DEFAULT '{"type":"none"}',
    environmentId INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS environments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    variables TEXT DEFAULT '[]',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  const envCount = await get('SELECT COUNT(1) AS count FROM environments');
  if (!envCount || envCount.count === 0) {
    await run(`INSERT INTO environments (name, variables) VALUES (?, ?);`, [
      'Default',
      JSON.stringify([
        { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com' },
        { key: 'userId', value: '1' }
      ])
    ]);
  }

  const collectionCount = await get('SELECT COUNT(1) AS count FROM collections');
  if (!collectionCount || collectionCount.count === 0) {
    const { lastID } = await run(`INSERT INTO collections (name) VALUES (?);`, ['Sample Collection']);
    await run(`INSERT INTO requests (collectionId, name, method, url, headers, query, bodyType, body, auth, environmentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
      lastID,
      'Get post 1',
      'GET',
      '{{baseUrl}}/posts/{{userId}}',
      JSON.stringify([]),
      JSON.stringify([]),
      'raw',
      '',
      JSON.stringify({ type: 'none' }),
      1
    ]);
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initialize,
  normalizeRow,
  safeParse,
};
