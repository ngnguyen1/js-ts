import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'querystring';
import formidable from 'formidable';

export async function jsonParser(req: IncomingMessage, res: ServerResponse) {
  if (req.headers['content-type']?.includes('application/json')) {
    const body = await new Promise<string>((resolve,reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    (req as any).body = JSON.parse(body);
  }
}

export async function urlencodedParser(req: IncomingMessage, res: ServerResponse) {
  if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
    const body = await new Promise<string>((resolve,reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    (req as any).body = parse(body);
  }
}

export async function multipartParser(req: IncomingMessage, res: ServerResponse) {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    const form = formidable({ multiples: false });
    const parsed = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });
    (req as any).body = parsed.fields;
    (req as any).files = parsed.files;
  }
}

export function apiKeyAuth(req: IncomingMessage, res: ServerResponse) {
  const key = req.headers['x-api-key'];
  if (key !== 'secret123') {
    const err: any = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
}

export function logger(req: IncomingMessage, res: ServerResponse) {
  console.log(`${req.method} ${req.url}`);
}

