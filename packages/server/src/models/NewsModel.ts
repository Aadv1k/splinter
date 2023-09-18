import * as Knex from 'knex';
import { PG_CONFIG } from "../config";
import { News, NewsArticle, NewsBias } from "../types"; 

import { v4 as uuidv4 } from "uuid";

class NewsModel {
    private readonly knex: Knex.Knex;

    constructor(knex: Knex.Knex) {
        this.knex = knex;
    }

    async init() {
        try {
            const articleTableExists = await this.knex.schema.hasTable('news_article');
            const biasTableExists = await this.knex.schema.hasTable('news_bias');

            if (!articleTableExists) {
                await this.knex.schema.createTable('news_article', (table: any) => {
                    table.uuid('id').primary();
                    table.text('title');
                    table.string('countryCode');
                    table.text('description');
                    table.timestamp('timestamp');
                    table.text('coverUrl');
                    table.text('url');
                });
            }

            if (!biasTableExists) {
                await this.knex.schema.createTable('news_bias', (table: any) => {
                    table.increments('id').primary();
                    table.integer('left_bias');
                    table.integer('right_bias');
                    table.uuid('article_id').references('id').inTable('news_article');
                });
            }

        } catch (error: any) {
            throw new Error(`Failed to initialize database: ${error.message}`);
        }
    }

    async getNewsArticlesBy(source: string, match: string): Promise<Array<News & NewsArticle>> {
        try {
            const dbNews = await this.knex('news_article').where(source, match).orderBy('timestamp', 'desc'); 
            return dbNews;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by ${source}: ${error.message}`);
        }
    }

    async insertNewsArticles(newsArticles: News[]): Promise<string[]> {
        try {
            const insertedIds: string[] = [];

            for (const news of newsArticles) {
                const articleId = uuidv4();
                await this.knex('news_article').insert({
                    id: articleId,
                    title: news.title,
                    description: news.description,
                    timestamp: news.timestamp,
                    coverUrl: news.coverUrl,
                    countryCode: news.countryCode,
                    url: news.url,
                });

                await this.knex('news_bias').insert({
                    left_bias: 0,
                    right_bias: 0,
                    article_id: articleId,
                });
                insertedIds.push(articleId);
            }
            return insertedIds;
        } catch (error: any) {
            throw new Error(`Failed to create news articles: ${error.message}`);
        }
    }

    async getLatestNewsArticles(): Promise<(News & NewsBias)[]> {
        try {
            const latestArticles = await this.knex
                .select('news_article.*', 'news_bias.left_bias', 'news_bias.right_bias')
                .from('news_article')
                .leftJoin('news_bias', 'news_article.id', 'news_bias.article_id')
                .orderBy('news_article.timestamp', 'desc')

            return latestArticles;
        } catch (error: any) {
            throw new Error(`Error fetching latest news articles: ${error.message}`);
        }
    }

    async close() {
        this.knex.destroy();
    }
}

const knexConfig = {
    client: 'pg',
    connection: {
        host: PG_CONFIG.host as string,
        user: PG_CONFIG.user as string,
        password: PG_CONFIG.password as string,
        database: PG_CONFIG.database as string,
        port: PG_CONFIG.port as number,
    },
};

const knex = Knex.default(knexConfig);
const newsModel = new NewsModel(knex);

export default newsModel;
