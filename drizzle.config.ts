import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  dbCredentials: {
    url: '/media/mchmb00e/USB_APP/app_commons/database.db',
  },
  out: './db',
});