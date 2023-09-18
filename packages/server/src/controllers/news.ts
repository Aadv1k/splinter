import { Request, Response } from "express";
import fetchNews, { isCountryCodeValid } from "../services/news";
import { ServerResponse, ErrorCode } from "../types";
import NewsModel from "../models/NewsModel";

export async function getNews(req: Request, res: Response) {
  try {
    const countryCode = req.params.country || "in";

    if (!isCountryCodeValid(countryCode)) {
      const errorResponse: ServerResponse = {
        status: "error",
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad input',
          description: `"${countryCode}" is not a valid country code`,
        },
      };
      return res.status(400).json(errorResponse);
    }

    const news = await fetchNews(countryCode);
    const responseData: ServerResponse = {
      status: "success",
      data: {
        articles: news,
        total_articles: news.length
      },
      message: `Successfully fetched and cached the news for ${countryCode}`
    };
    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error(`ERROR: news controller: ${error.message}`);
    
    const errorResponse: ServerResponse = {
      status: "error",
      error: {
        code: ErrorCode.InternalError,
        message: 'Internal server error',
        description: 'An error occurred while fetching news data.',
      }
    };
    return res.status(500).json(errorResponse);
  }
}
