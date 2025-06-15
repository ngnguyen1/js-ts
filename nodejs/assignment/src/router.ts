import { IncomingMessage, ServerResponse } from 'http';

type Handler = (req: IncomingMessage, res: ServerResponse, params?: Record<string,string>) => Promise<void> | void;
type Middleware = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

interface Route {
  method: string;
  path: string;
  handler: Handler;
  middleware: Middleware[];
}

export class Router {
  private routes: Route[] = [];

  use(mw: Middleware) {
    // global middleware
    this.routes.push({ method: 'MIDDLEWARE', path: '*', handler: null as any, middleware: [mw] });
  }

  register(method: string, path: string, handler: Handler, middleware: Middleware[] = []) {
    this.routes.push({ method, path, handler, middleware });
  }

  private matchRoute(method: string, url: string) {
    for (const route of this.routes) {
      if ((route.method === method || route.method === 'MIDDLEWARE') && this.matchPath(route.path, url)) {
        const params = this.extractParams(route.path, url);
        return { route, params };
      }
    }
    return null;
  }

  private matchPath(routePath: string, url: string) {
    if (routePath === '*') return true;
    const rSegments = routePath.split('/').filter(Boolean);
    const uSegments = url.split('?')[0].split('/').filter(Boolean);
    if (rSegments.length !== uSegments.length) return false;
    return rSegments.every((seg, i) => seg.startsWith(':') || seg === uSegments[i]);
  }

  private extractParams(routePath: string, url: string) {
    const params: Record<string,string> = {};
    const rSegments = routePath.split('/').filter(Boolean);
    const uSegments = url.split('?')[0].split('/').filter(Boolean);
    rSegments.forEach((seg, i) => {
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = uSegments[i];
      }
    });
    return params;
  }

  async handle(req: IncomingMessage, res: ServerResponse) {
    const match = this.matchRoute(req.method || '', req.url || '');
    if (!match) {
      res.writeHead(404, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }
    const { route, params } = match;
    try {
      for (const mw of route.middleware) {
        await mw(req, res);
      }
      await route.handler(req, res, params);
    } catch (err: any) {
      res.writeHead(err.statusCode || 500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

