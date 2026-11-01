import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../dist/main';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  appPromise ??= createApp().then(async (app) => {
    await app.init();
    return app;
  });
  const app = await appPromise;
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}