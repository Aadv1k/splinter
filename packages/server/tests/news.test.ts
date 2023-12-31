import request from 'supertest';
import app from '../src/server';

import NewsModel from "../src/models/NewsModel";

describe('Tests for /v1/news', () => {
  afterAll(async () => {
    await NewsModel.close();
  })

  test.todo('Should return news data without API key');

  test.todo('Should return news data with valid API key');
  test.todo('Should return rate-limit error without API key');
  test.todo('Should return news data with invalid API key');
  
  test.todo('Should return news data with valid API key and specific bias');
  test.todo('Should return an error for an invalid bias parameter');
  test.todo('Should handle pagination correctly');
});
