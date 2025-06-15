# HTTP/HTTPS Server in Node.js & TypeScript

A minimal web server built on Node’s built-in `http` and `https` modules.  
Features:

- Custom routing with path parameters & middleware  
- JSON, URL-encoded & multipart/form-data parsing  
- In-memory “Users” API (CRUD)  
- File-backed “Products” API with API-Key auth  
- Static form upload page  
- 302 Redirects  
- Centralized error handling  
- TLS support via self-signed cert  

---

## 📦 Prerequisites

- **Node.js** >= 14  
- **npm**  
- **TypeScript** & **ts-node** (dev)  
- **formidable** for multipart parsing  

---

## 🚀 Installation

```bash
git clone <repo-url>
cd http-server-ts

# install runtime deps
npm install formidable

# install dev deps
npm install --save-dev typescript @types/node ts-node
```

---

## 🔐 Generate Self-Signed Certificate

```bash
# In project root, run:
openssl req -nodes -new -x509 \
  -keyout key.pem -out cert.pem \
  -days 365 \
  -subj "/C=US/ST=State/L=City/O=Org/OU=Unit/CN=localhost"
```

This produces `key.pem` & `cert.pem` for HTTPS.

---

## 📁 Project Structure

```
http-server-ts/
├── src/
│   ├── router.ts          # Custom Router class
│   ├── middleware.ts      # JSON, URL-encoded, multipart parsers, auth & logger
│   └── server.ts          # HTTP/HTTPS servers & route registrations
├── data/
│   └── products.json      # File-backing store for Product API
├── key.pem                # TLS private key
├── cert.pem               # TLS certificate
├── tsconfig.json
└── package.json
```

---

## ⚙️ Configuration

- **HTTP port:** 3000  
- **HTTPS port:** 3443  
- **API-Key header:** `x-api-key: secret123`  
- **Products store:** `./data/products.json` (created on first write)

---

## 🏃‍♂️ Running the Server

```bash
# Compile & run with ts-node:
npx ts-node src/server.ts

# Or compile to JavaScript & run:
npx tsc
node dist/server.js
```

You should see:

```
HTTP Server listening on port 3000
HTTPS Server listening on port 3443
```

---

## 📝 Available Endpoints

### General

- `GET /`  
  _Hello World_ text

- `GET /redirect` → `302` → `/new-route`  
- `GET /new-route`  
  _“You have been redirected.”_

### Users API (in-memory)

- `GET    /api/users`  
- `GET    /api/users/:id`  
- `POST   /api/users`  
- `PUT    /api/users/:id`  
- `DELETE /api/users/:id`

_All accept / return JSON._

### Form & Upload

- `GET  /form`  
  HTML form for text & file upload  
- `POST /upload`  
  Returns parsed fields & file metadata (JSON)

### Products API (file-backed)

_All routes require header `x-api-key: secret123`_

- `GET  /api/products`  
- `POST /api/products`  
- _(You can extend with PUT/DELETE in the same pattern)_

---

## 🛠️ Error Handling

- Invalid routes → `404 { error: "Not Found" }`  
- Missing resources → `404 { error: "… not found" }`  
- Auth failures → `401 { error: "Unauthorized" }`  
- JSON parse errors → `400 { error: "Invalid JSON" }`  

---

## ✨ Extending

- Add new routes via `router.register(…)`  
- Insert global middleware with `router.use(…)`  
- Swap in a real DB by replacing file I/O in `server.ts`  

---

## 📄 License

MIT © Nga Nguyen
