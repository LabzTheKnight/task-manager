import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'DB/schema.prisma',
  migrations: {
    path: 'DB/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});