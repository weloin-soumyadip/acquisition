import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
const isNeonLocal = process.env.NEON_USE_LOCAL === 'true';
if (isNeonLocal) {
  neonConfig.fetchEndpoint =
    process.env.NEON_LOCAL_PROXY_URL || 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
