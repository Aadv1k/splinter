import { NEWSAPI_KEY, NODE_ENV } from "../config";
import { News } from "../types";
import superagent from 'superagent';

import exampleNewsapiData from "../data/example_newsapi.json";

export function isCountryCodeValid(countryCode: string): boolean {
    return (new Set([
        "ae",
        "ar",
        "at",
        "au",
        "be",
        "bg",
        "br",
        "ca",
        "ch",
        "cn",
        "co",
        "cu",
        "cz",
        "de",
        "eg",
        "fr",
        "gb",
        "gr",
        "hk",
        "hu",
        "id",
        "ie",
        "il",
        "in",
        "it",
        "jp",
        "kr",
        "lt",
        "lv",
        "ma",
        "mx",
        "my",
        "ng",
        "nl",
        "no",
        "nz",
        "ph",
        "pl",
        "pt",
        "ro",
        "rs",
        "ru",
        "sa",
        "se",
        "sg",
        "si",
        "sk",
        "th",
        "tr",
        "tw",
        "ua",
        "us",
        "ve",
        "za",
    ])).has(countryCode);
}

export default async function(countryCode?: string): Promise<Array<News>> {
    countryCode = countryCode ?? "in";
    
    if (!NEWSAPI_KEY) {
        throw new Error("ERROR: NEWSAPI_KEY not found. Refer to https://newsapi.org");
    }

    const fetchFromNewsAPI = async (query: string): Promise<any> => {
        try {
            const response = await superagent
                .get('https://newsapi.org/v2/top-headlines')
                .query({ q: query, apiKey: NEWSAPI_KEY, country: countryCode });

            return response.body;
        } catch (error: any) {
            throw error;
        }
    }

    let data;

    try {
         data = NODE_ENV === "development" ? exampleNewsapiData : await fetchFromNewsAPI("politics");
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
            countryCode,
        };
    });

    return news;
}
