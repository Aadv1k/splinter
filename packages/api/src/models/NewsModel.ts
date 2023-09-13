import * as Knex from 'knex';
import { PG_CONFIG } from "../config";
import { News } from "../services/newsService";

interface NewsDB {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    coverUrl?: string;
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
        const sourceTableExists = await this.knex.schema.hasTable('news_source');

        if (!articleTableExists) {
            await this.knex.schema.createTable('news_article', (table: any) => {
                table.uuid('id').primary();
                table.text('title');
                table.text('description');
                table.timestamp('timestamp');
                table.text('coverUrl');
            });
        }

        if (!biasTableExists) {
            await this.knex.schema.createTable('news_bias', (table: any) => {
                table.increments('id').primary();
                table.integer('left');
                table.integer('right');
                table.uuid('article_id').references('id').inTable('news_article');
            });
        }

        if (!sourceTableExists) {
            await this.knex.schema.createTable('news_source', (table: any) => {
                table.increments('id').primary();
                table.string('site');
                table.string('link');
                table.uuid('article_id').references('id').inTable('news_article');
            });
        }
    } catch (error: any) {
        throw new Error(`Failed to initialize database: ${error.message}`);
    }
}


    async newsExists(news: News): Promise<boolean> {
       try {
            const result = await this.knex('news_article')
                .select('id')
                .where({
                    title: news.title,
                    timestamp: news.timestamp,
                })
                .first();

            return !!result;
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
                coverUrl: news.coverUrl,
            }).returning('id');

            await this.knex('news_bias').insert({
                left: news.bias.left,
                right: news.bias.right,
                article_id: news.id,
            });

            await this.knex('news_source').insert({
                site: news.source.site,
                link: news.source.link,
                article_id: news.id,
            });

            return articleId;
        } catch (error: any) {
            throw new Error(`Failed to create news: ${error.message}`);
        }
    }

    async getNewsByDate(): Promise<News[]> {
        try {
            const dbNews: any = await this.knex('news_article')
                .select(
                    'news_article.id as article_id',
                    'news_article.title',
                    'news_article.description',
                    'news_article.timestamp',
                    'news_article.coverUrl',
                    'news_source.site as source_site',
                    'news_source.link as source_link',
                    'news_bias.left as bias_left',
                    'news_bias.right as bias_right'
                )
                .leftJoin('news_source', 'news_article.id', 'news_source.article_id')
                .leftJoin('news_bias', 'news_article.id', 'news_bias.article_id')
                .orderBy('news_article.timestamp', 'asc');

            const news: News[] = dbNews.map((dbRow: any) => ({
                id: dbRow.article_id,
                title: dbRow.title,
                description: dbRow.description,
                timestamp: dbRow.timestamp,
                coverUrl: dbRow.coverUrl,
                source: {
                    site: dbRow.source_site,
                    link: dbRow.source_link,
                },
                bias: {
                    left: dbRow.bias_left,
                    right: dbRow.bias_right,
                },
            }));

            return news;
        } catch (error: any) {
            throw new Error(`Failed to fetch news by date: ${error.message}`);
        }
    }


    async getNewsByBias(bias: "left" | "right"): Promise<News[]> {
        try {
            const dbNews: NewsDB[] = await this.knex('news_article')
                .select('*')
                .join('news_bias', 'news_article.id', 'news_bias.article_id')
                .where(`${bias}_bias`, '>', 0);

            return dbNews.map(this.mapDBToNews);
        } catch (error: any) {
            throw new Error(`Failed to fetch news by bias: ${error.message}`);
        }
    }

    async updateBiasByNewsID(id: string, leftBias: number, rightBias: number): Promise<void> {
        try {
            await this.knex('news_bias')
                .where('article_id', id)
                .update({
                    left: leftBias,
                    right: rightBias,
                });
        } catch (error: any) {
            throw new Error(`Failed to update bias for news: ${error.message}`);
        }
    }

    private mapDBToNews(dbNews: NewsDB): News {
        return {
            id: dbNews.id,
            title: dbNews.title,
            description: dbNews.description,
            timestamp: dbNews.timestamp,
            coverUrl: dbNews.coverUrl,
            bias: {
                left: 0,
                right: 0,
            },
            source: {
                site: '',
                link: '',
            },
        };
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
