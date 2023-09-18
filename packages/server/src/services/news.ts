import { NEWSAPI_KEY, NODE_ENV } from "../config";
import { News } from "../types";
import superagent from 'superagent';

import exampleNewsapiData from "../data/example_newsapi.json";

export default async function(countryCode?: string): Array<News> {
    countryCode = countryCode ?? "in";
    
    if (!NEWSAPI_KEY) {
        throw new Error("ERROR: NEWSAPI_KEY not found. Refer to https://newsapi.org");
    }

    const fetchFromNewsAPI = (query: string): Promise<any> {
        try {
            const response = await superagent
                .get('https://newsapi.org/v2/top-headlines')
                .query({ q: query, apiKey: this.apiKey, country: this.countryCode });

            return response.body;
        } catch (error: any) {
            throw error;
        }
    }

    let data;

    try {
         data = NODE_ENV === "development" ? exampleNewsapiData : await this.fetchFromNewsAPI("politics");
    } catch (error: any) {
        throw new Error(`ERROR: unable to fetch data from https://newsapi.org: ${error.message}`);
    }

    const news: News[] = data.articles.map((e: any) => {
        const parsedUrl = new URL(e.url);
        return {
            title: e.title,
            description: e.description,
            timestamp: e.publishedAt,
            coverurl: e.urlToImage,
            url: e.url,
        };
    });

    return news;
}
