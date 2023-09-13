import { Request, Response } from "express";

import NewsService from "../services/newsService";

export async function getNews(req: Request, res: Response) {
    let { country } = req.params;
    country = country ?? "in";

    try {
        const service = new NewsService(country);

        const news = await service.getNews();

        const total = news.length;
        const latest = total > 0 ? news[0].timestamp : null;

        const responseData = {
            data: news,
            meta: {
                total,
                latest,
            },
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching news:', error);

        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching news data.',
        });
    }
}
