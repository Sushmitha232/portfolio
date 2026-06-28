const express = require('express');
const cors = require('cors');
const { run, get, all, initialize, normalizeRow, safeParse } = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return fallback;
    }
  }
  return value;
}

function replaceVariables(template, variables) {
  if (typeof template !== 'string') return template;
  return template.replace(/{{\s*([\w-]+)\s*}}/g, (_, name) => {
    const found = variables.find((item) => item.key === name);
    return found ? found.value : '';
  });
}

function buildHeaders(headers = [], auth = { type: 'none' }) {
  const result = {};
  (headers || []).forEach(({ key, value }) => {
    if (key && value !== undefined) {
      result[key] = value;
    }
  });

  if (auth?.type === 'bearer' && auth.token) {
    result['Authorization'] = `Bearer ${auth.token}`;
  }
  if (auth?.type === 'basic' && auth.username !== undefined && auth.password !== undefined) {
    const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    result['Authorization'] = `Basic ${credentials}`;
  }

  return result;
}

function normalizeRowList(rows) {
  return rows.map((row) => normalizeRow(row));
}

function flattenItems(items) {
  const result = [];
  (items || []).forEach((item) => {
    if (item.item) {
      result.push(...flattenItems(item.item));
    } else {
      result.push(item);
    }
  });
  return result;
}

function toPostmanItem(request) {
  return {
    name: request.name || 'Request',
    request: {
      method: request.method || 'GET',
      header: (request.headers || []).filter((h) => h.key).map(({ key, value }) => ({ key, value })),
      url: {
        raw: request.url || '',
        query: (request.query || []).filter((q) => q.key).map(({ key, value }) => ({ key, value })),
      },
      body: request.bodyType === 'raw'
        ? { mode: 'raw', raw: request.body || '' }
        : request.bodyType === 'x-www-form-urlencoded'
          ? { mode: 'urlencoded', urlencoded: (request.body || []).filter((item) => item.key).map(({ key, value }) => ({ key, value })) }
          : { mode: 'formdata', formdata: (request.body || []).filter((item) => item.key).map(({ key, value }) => ({ key, value })) },
      auth: (() => {
        if (!request.auth || request.auth.type === 'none') return { type: 'noauth' };
        if (request.auth.type === 'bearer') return { type: 'bearer', bearer: [{ key: 'token', value: request.auth.token || '' }] };
        if (request.auth.type === 'basic') return {
          type: 'basic',
          basic: [
            { key: 'username', value: request.auth.username || '' },
            { key: 'password', value: request.auth.password || '' },
          ],
        };
        return { type: 'noauth' };
      })(),
    },
  };
}

function parsePostmanRequest(entry) {
  const request = entry.request || entry;
  const body = request.body || {};
  const parsedBody = request.body?.mode === 'raw'
    ? (body.raw || '')
    : (body.urlencoded || body.formdata || []).filter((item) => item.key).map(({ key, value }) => ({ key, value }));

  let auth = { type: 'none' };
  if (request.auth?.type === 'bearer') {
    auth = { type: 'bearer', token: request.auth.bearer?.[0]?.value || '' };
  } else if (request.auth?.type === 'basic') {
    auth = {
      type: 'basic',
      username: request.auth.basic?.find((item) => item.key === 'username')?.value || '',
      password: request.auth.basic?.find((item) => item.key === 'password')?.value || '',
    };
  }

  return {
    name: entry.name || 'Request',
    method: request.method || 'GET',
    url: typeof request.url === 'string' ? request.url : request.url?.raw || '',
    headers: (request.header || []).filter((item) => item.key).map(({ key, value }) => ({ key, value })),
    query: (request.url?.query || []).filter((item) => item.key).map(({ key, value }) => ({ key, value })),
    bodyType: body.mode || 'raw',
    body: parsedBody,
    auth,
  };
}

app.get('/api/user', (req, res) => {
  res.json({ id: 1, name: 'Demo User' });
});

app.get('/api/collections', async (req, res) => {
  const rows = await all('SELECT * FROM collections ORDER BY createdAt DESC');
  res.json(rows);
});

app.post('/api/collections', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Collection name is required' });
  const { lastID } = await run('INSERT INTO collections (name) VALUES (?);', [name]);
  res.json({ id: lastID, name });
});

app.put('/api/collections/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await run('UPDATE collections SET name = ? WHERE id = ?;', [name, id]);
  res.json({ id: Number(id), name });
});

app.delete('/api/collections/:id', async (req, res) => {
  const { id } = req.params;
  await run('DELETE FROM collections WHERE id = ?;', [id]);
  await run('DELETE FROM requests WHERE collectionId = ?;', [id]);
  res.json({ deleted: true });
});

app.get('/api/export/collection/:id', async (req, res) => {
  const { id } = req.params;
  const collection = await get('SELECT * FROM collections WHERE id = ?;', [id]);
  if (!collection) return res.status(404).json({ error: 'Collection not found' });
  const requests = normalizeRowList(await all('SELECT * FROM requests WHERE collectionId = ? ORDER BY createdAt DESC;', [id]));
  const payload = {
    info: {
      name: collection.name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: requests.map(toPostmanItem),
  };
  res.json(payload);
});

app.post('/api/import/collection', async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.info || !payload.item) {
    return res.status(400).json({ error: 'Invalid collection format' });
  }

  const collectionName = payload.info.name || 'Imported Collection';
  const { lastID } = await run('INSERT INTO collections (name) VALUES (?);', [collectionName]);
  const requests = flattenItems(payload.item);
  let importedCount = 0;

  for (const entry of requests) {
    const parsed = parsePostmanRequest(entry);
    const fields = [
      lastID,
      parsed.name,
      parsed.method,
      parsed.url,
      JSON.stringify(parsed.headers || []),
      JSON.stringify(parsed.query || []),
      parsed.bodyType || 'raw',
      parsed.body || '',
      JSON.stringify(parsed.auth || { type: 'none' }),
      null,
    ];
    await run(`INSERT INTO requests (collectionId, name, method, url, headers, query, bodyType, body, auth, environmentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, fields);
    importedCount += 1;
  }

  res.json({ collectionId: lastID, importedRequests: importedCount });
});

app.get('/api/requests', async (req, res) => {
  const { collectionId } = req.query;
  const rows = await all('SELECT * FROM requests WHERE collectionId = ? ORDER BY createdAt DESC;', [collectionId || null]);
  res.json(normalizeRowList(rows));
});

app.get('/api/requests/:id', async (req, res) => {
  const row = await get('SELECT * FROM requests WHERE id = ?;', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Request not found' });
  res.json(normalizeRow(row));
});

app.post('/api/requests', async (req, res) => {
  const payload = req.body;
  const fields = [
    payload.collectionId,
    payload.name,
    payload.method,
    payload.url,
    JSON.stringify(payload.headers || []),
    JSON.stringify(payload.query || []),
    payload.bodyType || 'raw',
    payload.body || '',
    JSON.stringify(payload.auth || { type: 'none' }),
    payload.environmentId || null,
  ];
  const { lastID } = await run(`INSERT INTO requests (collectionId, name, method, url, headers, query, bodyType, body, auth, environmentId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, fields);
  res.json({ id: lastID });
});

app.put('/api/requests/:id', async (req, res) => {
  const payload = req.body;
  await run(`UPDATE requests SET collectionId = ?, name = ?, method = ?, url = ?, headers = ?, query = ?, bodyType = ?, body = ?, auth = ?, environmentId = ? WHERE id = ?;`, [
    payload.collectionId,
    payload.name,
    payload.method,
    payload.url,
    JSON.stringify(payload.headers || []),
    JSON.stringify(payload.query || []),
    payload.bodyType || 'raw',
    payload.body || '',
    JSON.stringify(payload.auth || { type: 'none' }),
    payload.environmentId || null,
    req.params.id,
  ]);
  res.json({ id: Number(req.params.id) });
});

app.delete('/api/requests/:id', async (req, res) => {
  await run('DELETE FROM requests WHERE id = ?;', [req.params.id]);
  res.json({ deleted: true });
});

app.get('/api/environments', async (req, res) => {
  const rows = await all('SELECT * FROM environments ORDER BY createdAt DESC');
  res.json(rows.map((row) => ({
    ...row,
    variables: parseJson(row.variables, []),
  })));
});

app.post('/api/environments', async (req, res) => {
  const { name, variables } = req.body;
  const { lastID } = await run('INSERT INTO environments (name, variables) VALUES (?, ?);', [name, JSON.stringify(variables || [])]);
  res.json({ id: lastID, name, variables: variables || [] });
});

app.put('/api/environments/:id', async (req, res) => {
  const { name, variables } = req.body;
  await run('UPDATE environments SET name = ?, variables = ? WHERE id = ?;', [name, JSON.stringify(variables || []), req.params.id]);
  res.json({ id: Number(req.params.id), name, variables: variables || [] });
});

app.delete('/api/environments/:id', async (req, res) => {
  await run('DELETE FROM environments WHERE id = ?;', [req.params.id]);
  res.json({ deleted: true });
});

app.post('/api/run', async (req, res) => {
  try {
    const payload = req.body;
    const environment = payload.environmentId
      ? await get('SELECT * FROM environments WHERE id = ?;', [payload.environmentId])
      : null;
    const variables = environment ? parseJson(environment.variables, []) : [];

    const url = new URL(replaceVariables(payload.url || '', variables));
    const queryParams = payload.query || [];
    queryParams.forEach(({ key, value }) => {
      if (key) url.searchParams.set(key, replaceVariables(value || '', variables));
    });

    const headers = buildHeaders(payload.headers || [], payload.auth || { type: 'none' });
    Object.keys(headers).forEach((name) => {
      headers[name] = replaceVariables(headers[name], variables);
    });

    let body = null;
    if (payload.method !== 'GET' && payload.method !== 'HEAD') {
      if (payload.bodyType === 'form-data' && Array.isArray(payload.body)) {
        const formData = new URLSearchParams();
        payload.body.forEach(({ key, value }) => {
          if (key) formData.append(key, replaceVariables(value || '', variables));
        });
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = formData.toString();
      } else if (payload.bodyType === 'x-www-form-urlencoded' && Array.isArray(payload.body)) {
        const urlEncoded = new URLSearchParams();
        payload.body.forEach(({ key, value }) => {
          if (key) urlEncoded.append(key, replaceVariables(value || '', variables));
        });
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = urlEncoded.toString();
      } else if (payload.bodyType === 'raw') {
        body = replaceVariables(payload.body || '', variables);
      }
    }

    const start = Date.now();
    const response = await fetch(url.toString(), {
      method: payload.method || 'GET',
      headers,
      body,
    });
    const durationMs = Date.now() - start;
    const text = await response.text();

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let parsedBody = text;
    try {
      parsedBody = JSON.parse(text);
    } catch (err) {
      parsedBody = text;
    }

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: parsedBody,
      durationMs,
      size: Buffer.byteLength(text, 'utf8'),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Request failed' });
  }
});

initialize().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
