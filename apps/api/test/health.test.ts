import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './setup';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health — returns status ok', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /health — does not require API key', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });
});
