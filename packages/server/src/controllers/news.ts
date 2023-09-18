import { Request, Response } from "express";
import NewsService, { News } from "../services/newsService";
import { ErrorCode, ErrorResponse, SuccessResponse } from "../types";

import NewsModel from "../models/NewsModel";
import UserModel from "../models/UserModel";

import { JWT_SECRET } from "../config"

import jwt from "jsonwebtoken";

export async function voteForNews(req: Request, res: Response) {
  try {
    const newsId = req.params.id;
    const { vote: newsVote } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.Unauthorized,
          message: "Unauthorized",
          description: "Authorization header is missing.",
          details: null,
        },
        http_status: 401,
      };
      res.status(401).json(errorResponse);
      return;
    }

    const userId = extractUserIdFromToken(authHeader);

    if (!userId) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.Unauthorized,
          message: "Unauthorized",
          description: "Invalid or expired token.",
          details: null,
        },
        http_status: 401,
      };
      res.status(401).json(errorResponse);
      return;
    }

    const userVote = {
      article_id: newsId,
      user_id: userId,
      vote: newsVote,
    };

    await UserModel.createVote(userVote);

    if (!newsId) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.BadRequest,
          message: "Bad Request",
          description: "News ID is missing in the request params.",
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
          message: "Not Found",
          description: "News not found.",
          details: null,
        },
        http_status: 404,
      };
      res.status(404).json(errorResponse);
      return;
    }

    if (newsVote === 'left') {
      await NewsModel.updateBias(newsId, news.bias.left - 1, news.bias.right + 1);
    } else if (newsVote === 'right') {
      await NewsModel.updateBias(newsId, news.bias.left + 1, news.bias.right - 1);
    }

    const successResponse: SuccessResponse = {
      data: {
        message: "Vote submitted successfully",
      },
      meta: null,
      http_status: 200,
    };
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error("ERROR: /v1/news/vote:", error);
    const errorResponse: ErrorResponse = {
      error: {
        code: ErrorCode.InternalError,
        message: "Internal Server Error",
        description: "An unexpected error occurred while processing the request.",
        details: error.message,
      },
      http_status: 500,
    };
    res.status(500).json(errorResponse);
  }
}

function extractUserIdFromToken(token: string): string | null {
  try {
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    return decodedToken.userId;
  } catch (error) {
    return null;
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
  } catch (error: any) {
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
