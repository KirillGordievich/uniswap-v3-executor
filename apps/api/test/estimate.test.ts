import { INestApplication } from '@nestjs/common';
import { of } from 'rxjs';
import request from 'supertest';

import { createTestApp, mockSyncerService, TEST_API_KEY } from './setup';

const SELL_TOKEN = 'c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const BUY_TOKEN = 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

describe('EstimateController (e2e)', () => {
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

  describe('GET /v1/estimates/buy', () => {
    it('returns 401 without API key', async () => {
      await request(app.getHttpServer())
        .get('/v1/estimates/buy')
        .query({ tokenSellAddress: SELL_TOKEN, tokenBuyAddress: BUY_TOKEN, quantity: '1000000000000000000' })
        .expect(401);
    });

    it('returns 400 without required query params', async () => {
      await request(app.getHttpServer()).get('/v1/estimates/buy').set('x-api-key', TEST_API_KEY).expect(400);
    });

    it('returns 400 for non-hex tokenSellAddress', async () => {
      await request(app.getHttpServer())
        .get('/v1/estimates/buy')
        .set('x-api-key', TEST_API_KEY)
        .query({ tokenSellAddress: 'not-hex!', tokenBuyAddress: BUY_TOKEN, quantity: '100' })
        .expect(400);
    });

    it('returns 400 for empty quantity', async () => {
      await request(app.getHttpServer())
        .get('/v1/estimates/buy')
        .set('x-api-key', TEST_API_KEY)
        .query({ tokenSellAddress: SELL_TOKEN, tokenBuyAddress: BUY_TOKEN, quantity: '' })
        .expect(400);
    });

    it('returns estimated buy quantity', async () => {
      mockSyncerService.EstimateBuy.mockReturnValueOnce(of({ quantity: '2500000000' }));

      const response = await request(app.getHttpServer())
        .get('/v1/estimates/buy')
        .set('x-api-key', TEST_API_KEY)
        .query({ tokenSellAddress: SELL_TOKEN, tokenBuyAddress: BUY_TOKEN, quantity: '1000000000000000000' })
        .expect(200);

      expect(response.body).toEqual({ quantity: '2500000000' });
      expect(mockSyncerService.EstimateBuy).toHaveBeenCalledWith({
        tokenSellAddress: SELL_TOKEN,
        tokenBuyAddress: BUY_TOKEN,
        quantity: '1000000000000000000',
      });
    });
  });

  describe('GET /v1/estimates/sell', () => {
    it('returns 401 without API key', async () => {
      await request(app.getHttpServer())
        .get('/v1/estimates/sell')
        .query({ tokenSellAddress: SELL_TOKEN, tokenBuyAddress: BUY_TOKEN, quantity: '100' })
        .expect(401);
    });

    it('returns 400 without required query params', async () => {
      await request(app.getHttpServer()).get('/v1/estimates/sell').set('x-api-key', TEST_API_KEY).expect(400);
    });

    it('returns estimated sell quantity', async () => {
      mockSyncerService.EstimateSell.mockReturnValueOnce(of({ quantity: '500000000000000000' }));

      const response = await request(app.getHttpServer())
        .get('/v1/estimates/sell')
        .set('x-api-key', TEST_API_KEY)
        .query({ tokenSellAddress: SELL_TOKEN, tokenBuyAddress: BUY_TOKEN, quantity: '2500000000' })
        .expect(200);

      expect(response.body).toEqual({ quantity: '500000000000000000' });
      expect(mockSyncerService.EstimateSell).toHaveBeenCalledWith({
        tokenSellAddress: SELL_TOKEN,
        tokenBuyAddress: BUY_TOKEN,
        quantity: '2500000000',
      });
    });
  });
});
