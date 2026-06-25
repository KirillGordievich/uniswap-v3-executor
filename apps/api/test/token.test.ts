import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp, mockDatabaseService, TEST_API_KEY } from './setup';

const WETH_ADDRESS_HEX = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const MOCK_TOKEN_DB = {
  id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  address: Buffer.from('c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'hex'),
  decimals: 18,
  symbol: 'WETH',
  name: 'Wrapped Ether',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
};

const MOCK_USDC_DB = {
  id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  address: Buffer.from('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'hex'),
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
  createdAt: new Date('2025-01-02T00:00:00.000Z'),
};

describe('TokenController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/tokens', () => {
    it('returns 401 without API key', async () => {
      await request(app.getHttpServer()).get('/v1/tokens').expect(401);
    });

    it('returns 401 with invalid API key', async () => {
      await request(app.getHttpServer()).get('/v1/tokens').set('x-api-key', 'wrong-key').expect(401);
    });

    it('returns empty array when no tokens', async () => {
      mockDatabaseService.token.findMany.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .get('/v1/tokens')
        .set('x-api-key', TEST_API_KEY)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('returns list of tokens with hex addresses', async () => {
      mockDatabaseService.token.findMany.mockResolvedValueOnce([MOCK_TOKEN_DB, MOCK_USDC_DB]);

      const response = await request(app.getHttpServer())
        .get('/v1/tokens')
        .set('x-api-key', TEST_API_KEY)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({
        id: MOCK_TOKEN_DB.id,
        address: WETH_ADDRESS_HEX,
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
      expect(response.body[1]).toMatchObject({
        symbol: 'USDC',
        decimals: 6,
      });
    });
  });

  describe('GET /v1/tokens/:address', () => {
    it('returns 401 without API key', async () => {
      await request(app.getHttpServer()).get('/v1/tokens/abc123').expect(401);
    });

    it('returns 400 for non-hex address', async () => {
      await request(app.getHttpServer())
        .get('/v1/tokens/not-hex-value!')
        .set('x-api-key', TEST_API_KEY)
        .expect(400);
    });

    it('returns 404 when token not found', async () => {
      mockDatabaseService.token.findUnique.mockResolvedValueOnce(null);

      await request(app.getHttpServer())
        .get('/v1/tokens/c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
        .set('x-api-key', TEST_API_KEY)
        .expect(404);
    });

    it('returns token by address', async () => {
      mockDatabaseService.token.findUnique.mockResolvedValueOnce(MOCK_TOKEN_DB);

      const response = await request(app.getHttpServer())
        .get('/v1/tokens/c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
        .set('x-api-key', TEST_API_KEY)
        .expect(200);

      expect(response.body).toEqual({
        id: MOCK_TOKEN_DB.id,
        address: WETH_ADDRESS_HEX,
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });
  });
});
