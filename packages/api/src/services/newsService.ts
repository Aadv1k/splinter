import { NEWSAPI_KEY } from "../config";
import NewsModel from "../models/NewsModel";

import { v4 as uuidv4 } from "uuid";
import superagent from 'superagent';

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
    const leftDomains = [
        "nytimes.com",
        "washingtonpost.com",
        "cnn.com",
        "msnbc.com",
        "theguardian.com",
        "huffpost.com",
        "vox.com",
        "thenation.com",
        "newrepublic.com",
        "motherjones.com",
    ];
    return leftDomains.includes(strippedDomain);
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

    async cacheNews(news: News[]): Promise<News[] | null> {
        return null; 
    }


    async fetchNews(): Promise<Array<News>> {
        const data = await this.fetchDataFromNewsapi("politics");

        const news: News[] = data.articles.map(e => {
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
                    right: isOutletLeft(parsedUrl.hostname) ? 0 : 10,
                }
            } as News;
        });

        return news;
    }
}
