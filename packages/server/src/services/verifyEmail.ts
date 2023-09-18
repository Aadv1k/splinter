import superagent from 'superagent';
import { ABSTRACTAPI_KEY, NODE_ENV } from "../config";

export default async function(email: string): Promise<boolean> {
  // TODO: add the bad email to a bloom table or something, check it from there to save on API calls
  if (NODE_ENV === "development") {
      return true;
  }

  try {
    const response = await superagent
      .get('https://emailvalidation.abstractapi.com/v1/')
      .query({ api_key: ABSTRACTAPI_KEY, email })
      .set('Accept', 'application/json');

    const data = response.body;
    return data.deliverability === "DELIVERABLE";

  } catch (error: any) {
    throw new Error(`ERROR: was unable to verify email via Abstract API ${error.message}`);
  }
}
