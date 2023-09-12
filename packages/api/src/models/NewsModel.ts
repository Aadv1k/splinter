import * as Knex from 'knex';

interface NewsDB {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    coverUrl?: string;
    left_bias: number;
    right_bias: number;
    site: string;
    link: string;
}

export class NewsModel {
    private readonly knex: Knex;

    constructor(knex: Knex) {
        this.knex = knex;
    }

    async createNews(news: News): Promise<string> {
        try {
            const dbNews: NewsDB = {
                id: news.id,
                title: news.title,
                description: news.description,
                timestamp: news.timestamp,
                coverUrl: news.coverUrl,
                left_bias: news.bias.left,
                right_bias: news.bias.right,
                site: news.source.site,
                link: news.source.link,
            };

            await this.knex('news_table').insert(dbNews);

            return news.id;
        } catch (error) {
            throw new Error(`Failed to create news: ${error.message}`);
        }
    }

    async deleteNewsById(id: string): Promise<void> {
        try {
            await this.knex('news_table').where('id', id).del();
        } catch (error) {
            throw new Error(`Failed to delete news: ${error.message}`);
        }
    }

    async updateBiasById(id: string, leftBias: number, rightBias: number): Promise<void> {
        try {
            await this.knex('news_table')
                .where('id', id)
                .update({
                    left_bias: leftBias,
                    right_bias: rightBias,
                });
        } catch (error) {
            throw new Error(`Failed to update bias for news: ${error.message}`);
        }
    }

    async getNewsById(id: string): Promise<News | null> {
        try {
            const dbNews: NewsDB | undefined = await this.knex('news_table').select('*').where('id', id).first();
            
            if (!dbNews) {
                return null;
            }
            
            return this.mapDBToNews(dbNews);
        } catch (error) {
            throw new Error(`Failed to fetch news by ID: ${error.message}`);
        }
    }

    async getAllNews(): Promise<News[]> {
        try {
            const dbNews: NewsDB[] = await this.knex('news_table').select('*');
            return dbNews.map(this.mapDBToNews);
        } catch (error) {
            throw new Error(`Failed to fetch news: ${error.message}`);
        }
    }

    async getNewsByDate(): Promise<News[]> {
        try {
            const dbNews: NewsDB[] = await this.knex('news_table').select('*').orderBy('timestamp', 'asc');
            return dbNews.map(this.mapDBToNews);
        } catch (error) {
            throw new Error(`Failed to fetch news by date: ${error.message}`);
        }
    }

    async getNewsByBias(bias: 'left' | 'right'): Promise<News[]> {
        try {
            const dbNews: NewsDB[] = await this.knex('news_table').select('*').where(`${bias}_bias`, '>', 0);
            return dbNews.map(this.mapDBToNews);
        } catch (error) {
            throw new Error(`Failed to fetch news by bias: ${error.message}`);
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
                left: dbNews.left_bias,
                right: dbNews.right_bias,
            },
            source: {
                site: dbNews.site,
                link: dbNews.link,
            },
        };
    }
}
