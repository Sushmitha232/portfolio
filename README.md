# Postman Clone

This repository contains a Postman-like API client assignment built with:

- Backend: Express, SQLite, CORS
- Frontend: React, Vite

## Features

- Create, edit, delete collections
- Save requests inside collections
- Request builder with method, URL, headers, query params, and request body
- Authorization support: None, Bearer Token, Basic Auth
- Environments with `{{variable}}` substitution
- Send real HTTP requests via backend runner
- Response viewer with pretty/raw view, status, size, and time
- Seeded sample collection and environment

## Setup

### Backend

```bash
cd backend
npm install
npm start
```

The backend listens on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend uses Vite. The app will open on `http://localhost:5173`.

## Build

### Frontend production build

```bash
cd frontend
npm run build
```

## Notes

- The backend stores data in `backend/data.sqlite`.
- This implementation is designed to look and behave like a Postman-style API client.
- The frontend currently supports request CRUD and environment editing.

## Future Enhancements

- Import / export Postman Collection v2 JSON
- Pre-request and test scripts
- Code snippet generation
- Cookie management
- Dark mode and keyboard shortcuts
