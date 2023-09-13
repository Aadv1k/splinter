import { NEWSAPI_KEY, NODE_ENV } from "../config";
import NewsModel from "../models/NewsModel";
import { v4 as uuidv4 } from "uuid";
import superagent from 'superagent';

import exampleNewsapiData from "../data/example_newsapi.json";
import leftLeaningSites from "../data/left_leaning_sites.json";
import rightLeaningSites from "../data/right_leaning_sites.json";

interface NewsBias {
    right: number;
    left: number;
}

interface NewsSource {
    site: string;
    link: string;
}

export interface News {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    coverUrl?: string;
    bias: NewsBias;
    source: NewsSource;
}

const isOutletLeft = (domain: string): boolean => {
    const strippedDomain = domain.replace(/^www\./, "");
    return leftLeaningSites.includes(strippedDomain);
};

const isOutletRight = (domain: string): boolean => {
    const strippedDomain = domain.replace(/^www\./, "");
    return rightLeaningSites.includes(strippedDomain);
};

export default class NewsService {
    private apiKey: string;
    private countryCode: string;

    constructor(countryCode: string) {
        if (!NEWSAPI_KEY) {
            throw new Error("ERROR: NEWSAPI_KEY not found. Refer to https://newsapi.org");
        }
        this.apiKey = NEWSAPI_KEY;
        this.countryCode = countryCode;
    }

    private async fetchDataFromNewsapi(query: string): Promise<any> {
        try {
            const response = await superagent
                .get('https://newsapi.org/v2/top-headlines')
                .query({ q: query, apiKey: this.apiKey, country: this.countryCode });

            return response.body;
        } catch (error) {
            throw error;
        }
    }

    async getNews(): Promise<News[]> {
        return await NewsModel.getNewsByDate();
    }

    async cacheNews(news: News[]): Promise<void> {
        for (const item of news) {
            try {
                if (await NewsModel.newsExists(item)) continue;
                await NewsModel.createNews(item);
            } catch (err) {
                throw new Error(`ERROR: failed to create news of id ${item.id}, title ${item.title}: ${err}`);
            }
        }
    }

    async fetchNews(): Promise<News[]> {
        const data = NODE_ENV === "development"  ? exampleNewsapiData : await this.fetchDataFromNewsapi("politics");

        const news: News[] = data.articles.map((e: any) => {
            const parsedUrl = new URL(e.url);

            return {
                id: uuidv4(),
                title: e.title,
                description: e.description,
                timestamp: e.publishedAt,
                coverUrl: e.urlToImage,
                source: {
                    site: parsedUrl.hostname,
                    link: parsedUrl.href,
                },
                bias: {
                    left: isOutletLeft(parsedUrl.hostname) ? 10 : 0,
                    right: isOutletRight(parsedUrl.hostname) ? 10 : 0,
                }
            };
        });

        return news;
    }
}
