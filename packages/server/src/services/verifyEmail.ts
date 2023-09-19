import superagent from 'superagent';
import { ABSTRACTAPI_KEY, NODE_ENV } from '../config';
import LocalCache from './localCache';

const emailCache = new LocalCache<{ [email: string]: boolean }>(
  '.invalid_email_cache.json'
);

export default async function isValidEmail(email: string): Promise<boolean> {
  if (NODE_ENV === 'development') {
    return true;
  }

  try {
    const invalidCachedEmails = (await emailCache.read()) || {};
    if (invalidCachedEmails && invalidCachedEmails[email]) {
      return false;
    }

    const response = await superagent
      .get('https://emailvalidation.abstractapi.com/v1/')
      .query({ api_key: ABSTRACTAPI_KEY, email })
      .set('Accept', 'application/json');

    const data = response.body;

    if (data.deliverability === 'DELIVERABLE') {
      return true;
    }


    invalidCachedEmails[email] = true;
    await emailCache.store(invalidCachedEmails);

    return false;
  } catch (error: any) {
    throw new Error(`ERROR: Unable to verify email via Abstract API: ${error.message}`);
  }
}
