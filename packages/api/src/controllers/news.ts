import { Request, Response } from "express";
import NewsService, { News } from "../services/newsService";
import { ErrorCode, ErrorResponse, SuccessResponse } from "../types";
import NewsModel from "../models/NewsModel";

export async function voteForNews(req: Request, res: Response) {
  try {
    const newsId = req.params.id;

    if (!newsId) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad Request',
          description: 'News ID is missing in the request params.',
          details: null,
        },
        http_status: 400,
      };
      res.status(400).json(errorResponse);
      return; 
    }

    const news = await NewsModel.getNewsById(newsId);

    if (!news) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.NotFound,
          message: 'Not Found',
          description: 'News not found.',
          details: null,
        },
        http_status: 404,
      };
      res.status(404).json(errorResponse);
      return; // Exit the function
    }

    // TODO: Check for an authorization header (authentication logic goes here)

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.Unauthorized,
          message: 'Unauthorized',
          description: 'Authorization header is missing.',
          details: null,
        },
        http_status: 401,
      };
      res.status(401).json(errorResponse);
      return;
    }

    // TODO: not implemented

    const successResponse: SuccessResponse = {
        data: {
            message: "Vote submitted successfully"
        }
        meta: null,
        http_code: 200
    }
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('ERROR: /v1/news/vote:', error);
    const errorResponse: ErrorResponse = {
      error: {
        code: ErrorCode.InternalError,
        message: 'Internal Server Error',
        description: 'An unexpected error occurred while processing the request.',
        details: error.message,
      },
      http_status: 500,
    };
    res.status(500).json(errorResponse);
  }
}

export async function getNews(req: Request, res: Response) {
  try {
    const country = req.params.country || "in";
    const service = new NewsService(country);
    const news = await service.getNews();

    const total = news.length;
    const latest = total > 0 ? news[0].timestamp : null;

    const responseData: SuccessResponse<News[]> = {
      data: news,
      meta: {
        total,
        latest,
      },
      http_status: 200,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('ERROR: /api/v1/news :', error);

    const errorResponse: ErrorResponse = {
      error: {
        code: ErrorCode.InternalError,
        message: 'Internal server error',
        description: 'An error occurred while fetching news data.',
        details: error.message,
      },
      http_status: 500,
    };

    res.status(500).json(errorResponse);
  }
}
