import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
const bodyTypes = ['raw', 'form-data', 'x-www-form-urlencoded'];

const initialDraft = {
  name: 'New Request',
  collectionId: null,
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  headers: [{ key: 'Accept', value: 'application/json' }],
  query: [],
  bodyType: 'raw',
  body: '',
  auth: { type: 'none', token: '', username: '', password: '' },
  environmentId: null,
};

function formatJson(value) {
  try {
    return typeof value === 'string' ? JSON.stringify(JSON.parse(value), null, 2) : JSON.stringify(value, null, 2);
  } catch (err) {
    return value;
  }
}

function useFetchJson(url, options) {
  return fetch(url, options).then(async (res) => {
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || JSON.stringify(json));
    }
    return json;
  });
}

function App() {
  const [collections, setCollections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [draft, setDraft] = useState(initialDraft);
  const [response, setResponse] = useState(null);
  const [responseMode, setResponseMode] = useState('pretty');
  const [loading, setLoading] = useState(false);
  const importFileInput = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/collections`).then((res) => res.json()).then((collections) => {
      setCollections(collections);
      if (collections.length && !selectedCollectionId) {
        setSelectedCollectionId(collections[0].id);
        setDraft((prev) => ({ ...prev, collectionId: collections[0].id }));
      }
    });
    fetch(`${API_BASE}/api/environments`).then((res) => res.json()).then((items) => {
      setEnvironments(items);
      if (items[0]) {
        setDraft((prev) => ({ ...prev, environmentId: prev.environmentId || items[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCollectionId) return;
    fetch(`${API_BASE}/api/requests?collectionId=${selectedCollectionId}`).then((res) => res.json()).then(setRequests);
  }, [selectedCollectionId]);

  useEffect(() => {
    if (!selectedRequestId) return;
    fetch(`${API_BASE}/api/requests/${selectedRequestId}`).then((res) => res.json()).then((request) => {
      setDraft({
        ...initialDraft,
        ...request,
        headers: request.headers || [],
        query: request.query || [],
        auth: request.auth || { type: 'none' },
      });
    });
  }, [selectedRequestId]);

  useEffect(() => {
    if (!selectedRequestId && requests.length > 0) {
      setSelectedRequestId(requests[0].id);
    }
  }, [requests, selectedRequestId]);

  const selectedCollection = useMemo(() => collections.find((item) => item.id === selectedCollectionId), [collections, selectedCollectionId]);
  const selectedEnvironment = useMemo(() => environments.find((item) => item.id === draft.environmentId), [environments, draft.environmentId]);
  const responseText = useMemo(() => {
    if (!response) return '';
    return responseMode === 'raw' ? String(response.body) : formatJson(response.body || response);
  }, [response, responseMode]);

  const loadCollections = () => fetch(`${API_BASE}/api/collections`).then((res) => res.json()).then(setCollections);
  const loadRequests = () => {
    if (!selectedCollectionId) return setRequests([]);
    fetch(`${API_BASE}/api/requests?collectionId=${selectedCollectionId}`).then((res) => res.json()).then(setRequests);
  };

  const downloadJSON = (filename, payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCollection = async () => {
    if (!selectedCollectionId) return;
    const response = await fetch(`${API_BASE}/api/export/collection/${selectedCollectionId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Export failed');
    }
    const payload = await response.json();
    const collectionName = collections.find((c) => c.id === selectedCollectionId)?.name || 'collection';
    downloadJSON(`${collectionName.replace(/\s+/g, '_')}.postman_collection.json`, payload);
  };

  const handleImportCollectionClick = () => {
    importFileInput.current?.click();
  };

  const handleImportCollectionFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = await useFetchJson(`${API_BASE}/api/import/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadCollections();
      setSelectedCollectionId(result.collectionId);
      setSelectedRequestId(null);
      setDraft((prev) => ({ ...initialDraft, collectionId: result.collectionId, environmentId: prev.environmentId }));
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      event.target.value = ''; // reset input
    }
  };

  const handleCreateCollection = async () => {
    const name = window.prompt('Collection name', 'New Collection');
    if (!name) return;
    await useFetchJson(`${API_BASE}/api/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    await loadCollections();
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollectionId) return;
    if (!window.confirm('Delete collection and its requests?')) return;
    await useFetchJson(`${API_BASE}/api/collections/${selectedCollectionId}`, { method: 'DELETE' });
    setSelectedCollectionId(null);
    setSelectedRequestId(null);
    await loadCollections();
    setRequests([]);
  };

  const handleCreateEnvironment = async () => {
    const name = window.prompt('Environment name', 'New Environment');
    if (!name) return;
    await useFetchJson(`${API_BASE}/api/environments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, variables: [] }),
    });
    const envs = await fetch(`${API_BASE}/api/environments`).then((res) => res.json());
    setEnvironments(envs);
  };

  const handleSaveEnvironment = async () => {
    if (!selectedEnvironment) return;
    const variables = selectedEnvironment.variables || [];
    await useFetchJson(`${API_BASE}/api/environments/${selectedEnvironment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: selectedEnvironment.name, variables }),
    });
    const envs = await fetch(`${API_BASE}/api/environments`).then((res) => res.json());
    setEnvironments(envs);
  };

  const handleSaveRequest = async () => {
    if (!selectedCollectionId) {
      alert('Pick or create a collection first.');
      return;
    }
    const body = {
      ...draft,
      collectionId: selectedCollectionId,
      headers: draft.headers.filter((item) => item.key),
      query: draft.query.filter((item) => item.key),
      auth: draft.auth,
      environmentId: draft.environmentId,
    };
    if (selectedRequestId) {
      await useFetchJson(`${API_BASE}/api/requests/${selectedRequestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      const result = await useFetchJson(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSelectedRequestId(result.id);
    }
    await loadRequests();
  };

  const handleRunRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const payload = {
        method: draft.method,
        url: draft.url,
        headers: draft.headers.filter((item) => item.key),
        query: draft.query.filter((item) => item.key),
        bodyType: draft.bodyType,
        body: draft.bodyType === 'raw' ? draft.body : draft.body,
        auth: draft.auth,
        environmentId: draft.environmentId,
      };
      const result = await useFetchJson(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setResponse(result);
      setResponseMode('pretty');
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (field) => {
    setDraft((prev) => ({ ...prev, [field]: [...(prev[field] || []), { key: '', value: '' }] }));
  };

  const handleFieldChange = (field, index, key, value) => {
    setDraft((prev) => {
      const list = [...(prev[field] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [field]: list };
    });
  };

  const handleRemoveField = (field, index) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddBodyField = () => {
    setDraft((prev) => ({
      ...prev,
      body: [...(prev.body || []), { key: '', value: '' }],
    }));
  };

  const handleBodyFieldChange = (index, key, value) => {
    setDraft((prev) => {
      const list = [...(prev.body || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, body: list };
    });
  };

  const handleDeleteBodyField = (index) => {
    setDraft((prev) => ({
      ...prev,
      body: prev.body.filter((_, i) => i !== index),
    }));
  };

  const handleNewRequest = () => {
    if (!selectedCollectionId) {
      alert('Pick or create a collection first.');
      return;
    }
    setSelectedRequestId(null);
    setDraft({
      ...initialDraft,
      collectionId: selectedCollectionId,
      environmentId: draft.environmentId,
      headers: [{ key: 'Accept', value: 'application/json' }],
    });
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequestId) return;
    if (!window.confirm('Delete this request?')) return;
    await useFetchJson(`${API_BASE}/api/requests/${selectedRequestId}`, { method: 'DELETE' });
    setSelectedRequestId(null);
    setDraft((prev) => ({ ...initialDraft, collectionId: selectedCollectionId, environmentId: prev.environmentId }));
    await loadRequests();
  };

  const handleEnvironmentNameChange = (value) => {
    if (!selectedEnvironment) return;
    setEnvironments((prev) => prev.map((item) => item.id === selectedEnvironment.id ? { ...item, name: value } : item));
  };

  const handleDeleteEnvironment = async () => {
    if (!selectedEnvironment) return;
    if (!window.confirm('Delete this environment?')) return;
    await useFetchJson(`${API_BASE}/api/environments/${selectedEnvironment.id}`, { method: 'DELETE' });
    const envs = await fetch(`${API_BASE}/api/environments`).then((res) => res.json());
    setEnvironments(envs);
    setDraft((prev) => ({ ...prev, environmentId: envs[0]?.id || null }));
  };

  const handleEnvironmentVariableChange = (index, key, value) => {
    if (!selectedEnvironment) return;
    const updated = [...selectedEnvironment.variables];
    updated[index] = { ...updated[index], [key]: value };
    setEnvironments((prev) => prev.map((item) => item.id === selectedEnvironment.id ? { ...item, variables: updated } : item));
  };

  const handleAddEnvironmentVariable = () => {
    if (!selectedEnvironment) return;
    setEnvironments((prev) => prev.map((item) => item.id === selectedEnvironment.id ? { ...item, variables: [...item.variables, { key: '', value: '' }] } : item));
  };

  const handleSaveEnvironmentVariable = () => {
    handleSaveEnvironment();
  };

  function renderAuthFields() {
    switch (draft.auth.type) {
      case 'bearer':
        return (
          <label className="field-row">
            Bearer Token
            <input
              value={draft.auth.token || ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, auth: { ...prev.auth, token: e.target.value } }))}
            />
          </label>
        );
      case 'basic':
        return (
          <>
            <label className="field-row">
              Username
              <input
                value={draft.auth.username || ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, auth: { ...prev.auth, username: e.target.value } }))}
              />
            </label>
            <label className="field-row">
              Password
              <input
                type="password"
                value={draft.auth.password || ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, auth: { ...prev.auth, password: e.target.value } }))}
              />
            </label>
          </>
        );
      default:
        return <p className="field-note">No authorization applied.</p>;
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <section className="panel">
          <div className="panel-header">
            <h2>Collections</h2>
            <button onClick={handleCreateCollection}>New</button>
          </div>
          <div className="panel-list">
            {collections.map((collection) => (
              <button
                key={collection.id}
                className={collection.id === selectedCollectionId ? 'selected' : ''}
                onClick={() => {
                  setSelectedCollectionId(collection.id);
                  setSelectedRequestId(null);
                  setDraft((prev) => ({ ...prev, collectionId: collection.id }));
                }}
              >
                {collection.name}
              </button>
            ))}
          </div>
          <div className="sidebar-actions collection-actions">
            <button onClick={handleExportCollection} disabled={!selectedCollectionId}>Export</button>
            <button onClick={handleImportCollectionClick}>Import</button>
            <button onClick={handleNewRequest} disabled={!selectedCollectionId}>New request</button>
            <button className="danger" onClick={handleDeleteCollection} disabled={!selectedCollectionId}>
              Delete collection
            </button>
          </div>
          <input type="file" accept="application/json" ref={importFileInput} style={{ display: 'none' }} onChange={handleImportCollectionFile} />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Environments</h2>
            <button onClick={handleCreateEnvironment}>New</button>
          </div>
          <select
            value={draft.environmentId || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, environmentId: Number(e.target.value) }))}
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          {selectedEnvironment && (
            <div className="env-panel">
              <label className="field-row">
                Environment name
                <input
                  value={selectedEnvironment.name}
                  onChange={(e) => handleEnvironmentNameChange(e.target.value)}
                />
              </label>
              <div className="env-grid">
                {(selectedEnvironment.variables || []).map((item, index) => (
                  <div key={index} className="env-row">
                    <input
                      placeholder="key"
                      value={item.key}
                      onChange={(e) => handleEnvironmentVariableChange(index, 'key', e.target.value)}
                    />
                    <input
                      placeholder="value"
                      value={item.value}
                      onChange={(e) => handleEnvironmentVariableChange(index, 'value', e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="env-actions">
                <button onClick={handleAddEnvironmentVariable}>Add variable</button>
                <button onClick={handleSaveEnvironmentVariable}>Save environment</button>
                <button className="danger" onClick={handleDeleteEnvironment}>Delete environment</button>
              </div>
            </div>
          )}
        </section>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <h1>Postman Clone</h1>
            <p>Send real HTTP requests, manage collections, and inspect responses.</p>
          </div>
          <div className="workspace-actions">
            <span>{selectedCollection ? selectedCollection.name : 'No collection selected'}</span>
          </div>
        </header>

        <section className="request-panel">
          <div className="request-meta">
            <label className="field-row">
              Request name
              <input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <div className="method-url">
              <select
                value={draft.method}
                onChange={(e) => setDraft((prev) => ({ ...prev, method: e.target.value }))}
              >
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <input
                className="url-input"
                placeholder="https://api.example.com/path"
                value={draft.url}
                onChange={(e) => setDraft((prev) => ({ ...prev, url: e.target.value }))}
              />
              <button className="send-button" onClick={handleRunRequest} disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>

          <div className="tabs-row">
            <div className="tab-group">
              <div className="tab-title">Headers</div>
              {draft.headers.map((header, index) => (
                <div key={index} className="tab-row">
                  <input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => handleFieldChange('headers', index, 'key', e.target.value)}
                  />
                  <input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleFieldChange('headers', index, 'value', e.target.value)}
                  />
                  <button className="small" onClick={() => handleRemoveField('headers', index)}>
                    ×
                  </button>
                </div>
              ))}
              <button className="tiny" onClick={() => handleAddField('headers')}>Add header</button>
            </div>

            <div className="tab-group">
              <div className="tab-title">Query Params</div>
              {draft.query.map((param, index) => (
                <div key={index} className="tab-row">
                  <input
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => handleFieldChange('query', index, 'key', e.target.value)}
                  />
                  <input
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => handleFieldChange('query', index, 'value', e.target.value)}
                  />
                  <button className="small" onClick={() => handleRemoveField('query', index)}>
                    ×
                  </button>
                </div>
              ))}
              <button className="tiny" onClick={() => handleAddField('query')}>Add query param</button>
            </div>
          </div>

          <div className="tabs-row">
            <div className="tab-group body-panel">
              <div className="tab-title">Body</div>
              <select
                value={draft.bodyType}
                onChange={(e) => setDraft((prev) => ({
                  ...prev,
                  bodyType: e.target.value,
                  body: e.target.value === 'raw' ? '' : [],
                }))}
              >
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {draft.bodyType === 'raw' ? (
                <textarea
                  value={draft.body}
                  onChange={(e) => setDraft((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Request body"
                />
              ) : (
                <>
                  {(draft.body || []).map((item, index) => (
                    <div key={index} className="tab-row">
                      <input
                        placeholder="Key"
                        value={item.key}
                        onChange={(e) => handleBodyFieldChange(index, 'key', e.target.value)}
                      />
                      <input
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => handleBodyFieldChange(index, 'value', e.target.value)}
                      />
                      <button className="small" onClick={() => handleDeleteBodyField(index)}>
                        ×
                      </button>
                    </div>
                  ))}
                  <button className="tiny" onClick={handleAddBodyField}>Add body field</button>
                </>
              )}
            </div>

            <div className="tab-group auth-panel">
              <div className="tab-title">Authorization</div>
              <select
                value={draft.auth.type}
                onChange={(e) => setDraft((prev) => ({ ...prev, auth: { type: e.target.value } }))}
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
              {renderAuthFields()}
            </div>
          </div>

          <div className="save-actions">
            <button onClick={handleSaveRequest} disabled={!selectedCollectionId}>Save request</button>
            <button onClick={handleDeleteRequest} disabled={!selectedRequestId}>Delete request</button>
            <button onClick={loadRequests}>Refresh requests</button>
          </div>
        </section>

        <section className="response-panel">
          <div className="response-header">
            <div>
              <span className="badge">Status: {response?.status ?? '--'}</span>
              <span className="badge">Time: {response?.durationMs ?? '--'} ms</span>
              <span className="badge">Size: {response?.size ?? '--'} bytes</span>
            </div>
            <div>
              <button className={responseMode === 'pretty' ? 'active' : ''} onClick={() => setResponseMode('pretty')}>
                Pretty
              </button>
              <button className={responseMode === 'raw' ? 'active' : ''} onClick={() => setResponseMode('raw')}>
                Raw
              </button>
            </div>
          </div>
          <pre className="response-body">{response ? responseText : 'Run a request to inspect the response.'}</pre>
        </section>
      </main>

      <aside className="request-list">
        <section className="panel request-list-panel">
          <div className="panel-header">
            <h2>Requests</h2>
          </div>
          <div className="panel-list">
            {requests.map((request) => (
              <button
                key={request.id}
                className={request.id === selectedRequestId ? 'selected' : ''}
                onClick={() => {
                  setSelectedRequestId(request.id);
                }}
              >
                {request.name}
              </button>
            ))}
          </div>
          <div className="sidebar-actions">
            <button onClick={handleNewRequest} disabled={!selectedCollectionId}>New request</button>
            <button className="danger" onClick={handleDeleteRequest} disabled={!selectedRequestId}>Delete request</button>
          </div>
        </section>
      </aside>
    </div>
  );
}

export default App;
