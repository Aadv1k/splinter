import * as Knex from 'knex';
import { PG_CONFIG } from "../config";
import { News, NewsArticle, NewsBias } from "../types"; 

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

    async getNewsArticleBy(source: string, match: string): Promise<News & NewsArticle | null> {
        try {
            const dbNews = await this.knex('news_article').where(source, match).first(); 
            if (!dbNews) {
                return null;
            }

            const newsWithArticle: News & NewsArticle = {
                id: dbNews.id,
                title: dbNews.title,
                description: dbNews.description,
                timestamp: dbNews.timestamp,
                cover_url: dbNews.cover_url,
                url: dbNews.url,
            };

            return newsWithArticle;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by ${source}: ${error.message}`);
        }
    }

    async createNews(news: News & NewsArticle): Promise<string> {
        try {
            const [articleId] = await this.knex('news_article').insert({
                id: news.id,
                title: news.title,
                description: news.description,
                timestamp: news.timestamp,
                cover_url: news.cover_url,
                url: news.url
            }).returning('id');

            await this.knex('news_bias').insert({
                left_bias: news.left_bias,
                right_bias: news.right_bias,
                article_id: news.id,
            });

            return articleId;
        } catch (error: any) {
            throw new Error(`Failed to create news: ${error.message}`);
        }
    }

    async getLatestNewsArticles(): Promise<(News & NewsBias)[]> {
        try {
            const newsData = await this.knex('news_article')
                .select('news_article.*', 'news_bias.left_bias', 'news_bias.right_bias')
                .join('news_bias', 'news_article.id', 'news_bias.article_id')
                .orderBy('news_article.timestamp', 'asc');

            const newsArticles: (News & NewsBias)[] = newsData.map((result: any) => {
                const { left_bias, right_bias, ...newsDataWithoutBias } = result;

                const newsBias: NewsBias = {
                    left_bias,
                    right_bias,
                };

                const combinedObject: News & NewsBias = {
                    ...newsDataWithoutBias,
                    ...newsBias,
                };

                return combinedObject;
            });

            return newsArticles;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by date: ${error.message}`);
        }
    }

    async updateBias(newsId: string, leftBias: number, rightBias: number): Promise<void> {
        try {
            await this.knex('news_bias')
                .where('article_id', newsId)
                .update({
                    left_bias: leftBias,
                    right_bias: rightBias,
                });
        } catch (error: any) {
            throw new Error(`Failed to update bias for news: ${error.message}`);
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
