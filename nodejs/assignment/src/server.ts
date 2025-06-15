import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { Router } from './router';
import { logger, jsonParser, urlencodedParser, multipartParser, apiKeyAuth } from './middleware';
import { parse } from 'url';

const router = new Router();

// Global middleware
router.use(logger);

// 1. Basic HTTP Server
router.register('GET', '/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});

// 2. User API (in-memory)
let users: any[] = [];
let userId = 1;

router.register('GET', '/api/users', (req, res) => {
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify(users));
});

router.register('GET', '/api/users/:id', (req, res, params) => {
  const u = users.find(x=>x.id===+params!.id);
  if (!u) throw Object.assign(new Error('User not found'), {statusCode:404});
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify(u));
});

// Parse JSON for POST/PUT
router.use(jsonParser);

router.register('POST', '/api/users', (req: any, res) => {
  const u = { id: userId++, ...req.body };
  users.push(u);
  res.writeHead(201, {'Content-Type':'application/json'});
  res.end(JSON.stringify(u));
});

router.register('PUT', '/api/users/:id', (req: any, res, params) => {
  const idx = users.findIndex(x=>x.id===+params!.id);
  if(idx<0) throw Object.assign(new Error('User not found'), {statusCode:404});
  users[idx] = { ...users[idx], ...req.body };
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify(users[idx]));
});

router.register('DELETE', '/api/users/:id', (req, res, params) => {
  const idx = users.findIndex(x=>x.id===+params!.id);
  if(idx<0) throw Object.assign(new Error('User not found'), {statusCode:404});
  const [removed] = users.splice(idx,1);
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify(removed));
});

// 3. Request Data Processing: Form
router.register('GET', '/form', (_, res) => {
  const html = `<form action="/upload" method="post" enctype="multipart/form-data">
    <input name="title"/><input type="file" name="file"/><button>Submit</button>
  </form>`;
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end(html);
});

router.use(urlencodedParser);
router.use(multipartParser);

router.register('POST', '/upload', (req: any, res) => {
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ fields: req.body, files: req.files }));
});

// 4. Router Module tested above

// 5. Product API (file-backed) with API key
router.register('POST', '/api/products', async (req: any, res) => {
  apiKeyAuth(req, res);
  const dataFile = './data/products.json';
  const products = existsSync(dataFile) ? JSON.parse(readFileSync(dataFile,'utf-8')) : [];
  const newProd = { id: Date.now(), ...req.body };
  products.push(newProd);
  writeFileSync(dataFile, JSON.stringify(products, null, 2));
  res.writeHead(201, {'Content-Type':'application/json'});
  res.end(JSON.stringify(newProd));
});

router.register('GET', '/api/products', (req, res) => {
  apiKeyAuth(req, res);
  const dataFile = './data/products.json';
  const products = existsSync(dataFile) ? JSON.parse(readFileSync(dataFile,'utf-8')) : [];
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify(products));
});

// PUT, DELETE similar pattern...
// 6. Redirect example
router.register('GET', '/old-route', (_, res) => {
  res.writeHead(302, { Location: '/new-route' });
  res.end();
});
router.register('GET', '/new-route', (_, res) => {
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('You have been redirected.');
});

// Create servers
const httpServer = createHttpServer((req, res) => router.handle(req, res));
const httpsOptions = {
  key: readFileSync('key.pem'),
  cert: readFileSync('cert.pem')
};
const httpsServer = createHttpsServer(httpsOptions, (req, res) => router.handle(req, res));

httpServer.listen(3000, () => console.log('HTTP on 3000'));
httpsServer.listen(3443, () => console.log('HTTPS on 3443'));

