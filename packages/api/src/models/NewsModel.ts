import * as Knex from 'knex';
import { PG_CONFIG } from "../config";
import { News } from "../services/newsService";

interface NewsArticle {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    cover_url?: string;
    url: string;
}

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
                    table.text('description');
                    table.timestamp('timestamp');
                    table.text('cover_url');
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


    async getNewsById(id: string): Promise<News | null> {
        try {
            const dbNews = await this.knex('news_article')
                .select(
                    'news_article.id',
                    'news_article.title',
                    'news_article.description',
                    'news_article.timestamp',
                    'news_article.cover_url',
                    'news_article.url',
                    'news_bias.left_bias as left_bias',
                    'news_bias.right_bias as right_bias'
                )
                .leftJoin('news_bias', 'news_article.id', 'news_bias.article_id')
                .where('news_article.id', id)
                .first();

            if (!dbNews) {
                return null;
            }

            const news: News = {
                id: dbNews.article_id,
                title: dbNews.title,
                description: dbNews.description,
                timestamp: dbNews.timestamp,
                coverUrl: dbNews.coverUrl,
                bias: {
                    left: dbNews.left_bias,
                    right: dbNews.right_bias,
                },
            };
            return news;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by ID: ${error.message}`);
        }
    }

    async getNewsByTitle(title: string): Promise<NewsArticle> {
        try {
            const result = await this.knex('news_article')
                .select('*')
                .where({
                    title,
                })
                .first();
            return result;
        } catch (error: any) {
            throw new Error(`Failed to check if the news article exists: ${error.message}`);
        }
    }

    async createNews(news: News): Promise<string> {
        try {
            const [ articleId ] = await this.knex('news_article').insert({
                id: news.id,
                title: news.title,
                description: news.description,
                timestamp: news.timestamp,
                cover_url: news.cover_url,
                url: news.url
            }).returning('id');

            await this.knex('news_bias').insert({
                left: news.bias.left_bias,
                right: news.bias.right_bias,
                article_id: news.id,
            });

            return articleId;
        } catch (error: any) {
            throw new Error(`Failed to create news: ${error.message}`);
        }
    }

    async getNewsByDate(): Promise<News[]> {
        try {
            const dbNews = await this.knex<News>('news_article')
                .select(
                    'news_article.id',
                    'news_article.title',
                    'news_article.description',
                    'news_article.timestamp',
                    'news_article.cover_url',
                    'news_article.url',
                    'news_bias.left_bias as bias.left',
                    'news_bias.right_bias as bias.right'
                )
                .leftJoin('news_bias', 'news_article.id', 'news_bias.article_id')
                .orderBy('news_article.timestamp', 'asc');

            const newsList: News[] = dbNews.map((dbItem: any) => ({
                id: dbItem.id,
                title: dbItem.title,
                description: dbItem.description,
                timestamp: dbItem.timestamp,
                cover_url: dbItem.cover_url,
                url: dbItem.url,
                bias: {
                    left: dbItem['bias.left'],
                    right: dbItem['bias.right'],
                },
            }));

            return newsList;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by date: ${error.message}`);
        }
    }

    async getNewsByBias(bias: 'left' | 'right'): Promise<News[]> {
        try {
            const dbNews = await this.knex<News>('news_article')
                .select(
                    'news_article.id',
                    'news_article.title',
                    'news_article.description',
                    'news_article.timestamp',
                    'news_article.cover_url',
                    'news_article.url',
                    'news_bias.left_bias as bias.left',
                    'news_bias.right_bias as bias.right'
                )
                .leftJoin('news_bias', 'news_article.id', 'news_bias.article_id')
                .where(`news_bias.${bias}_bias`, '>', 0);

            const newsList: News[] = dbNews.map((dbItem: any) => ({
                id: dbItem.id,
                title: dbItem.title,
                description: dbItem.description,
                timestamp: dbItem.timestamp,
                cover_url: dbItem.cover_url,
                url: dbItem.url,
                bias: {
                    left: dbItem['bias.left'],
                    right: dbItem['bias.right'],
                },
            }));

            return newsList;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by bias: ${error.message}`);
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
