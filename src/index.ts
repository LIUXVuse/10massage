import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    return new Response('Hello from Wrangler!');
  },
}; 