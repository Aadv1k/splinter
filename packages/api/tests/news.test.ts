import request from 'supertest';
import app from '../src/server';

import NewsModel from "../src/models/NewsModel";

describe('Tests for /v1/news', () => {
  afterAll(async () => {
      await NewsModel.close();
  })

  test('Should return news data without API key', async () => {
      const response = await request(app)
          .get('/v1/news')
      const data = response.body;
      expect(response.status).toBe(200);

      expect(resposne.b )
  });

  test.todo('Should return news data with valid API key');
  test.todo('Should return rate-limit error without API key');
  test.todo('Should return news data with invalid API key');
  
  test.todo('Should return news data with valid API key and specific bias');
  test.todo('Should return an error for an invalid bias parameter');
  test.todo('Should handle pagination correctly');
});
