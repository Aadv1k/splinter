import { Request, Response } from "express";
import fetchNews, { isCountryCodeValid } from "../services/news";
import { ServerResponse, ErrorCode } from "../types";
import { JWT_SECRET } from "../config";
import NewsModel from "../models/NewsModel";
import jwt from 'jsonwebtoken'; // Import jwt

export async function postVote(req: Request, res: Response) {
    const newsid = req.params?.newsid as string;
    if (!newsid) {
      const errorResponse: ServerResponse = {
        status: "error",
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad input',
          description: "missing news id -> /:id",
        },
      };
      return res.status(400).json(errorResponse);
    }

    const foundNews = await NewsModel.getNewsArticlesBy("id", newsid);

    if (!foundNews) {
      const errorResponse: ServerResponse = {
        status: "error",
        error: {
          code: ErrorCode.NotFound,
          message: 'Resource not found',
          description: `news of id ${newsid} not found`,
        },
      };
      return res.status(404).json(errorResponse);
    }

    const auth = req.headers?.authentication;

    if (!auth || Array.isArray(auth)) { // Check if auth is an array
      return res.status(401).json({
        status: "error",
        error: {
          code: ErrorCode.Unauthorized,
          message: 'Unauthorized',
          description: "did not find a valid authentication header",
        },
      } as ServerResponse);
    }

    const jwtToken = auth.split(" ").pop();
    let parsedToken;

    try {
      parsedToken = jwt.verify(jwtToken as string, JWT_SECRET);
    } catch {
      return res.status(401).json({
        status: "error",
        error: {
          code: ErrorCode.Unauthorized,
          message: 'Unauthorized',
          description: "JWT token invalid, sign in again",
        },
      } as ServerResponse);
    } 

    const data = req.body;

    if (!data || !data?.vote) {
      return res.status(400).json({
        status: "error",
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad input',
          description: "invalid data sent in for the vote",
        },
      } as ServerResponse);
    }

    const voteSide = data.vote;

    // TODO: get past user votes for this news id
    // TODO: if voteSide exists in the above, return error, cant vote twice
    // TODO: if voteSide does not exist, cast a vote. Find the news_id in the news_bias and increment the target  
}

export async function getNews(req: Request, res: Response) {
  try {
    const countryCode = req.query.country as string || "in";
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

    let news = await NewsModel.getNewsArticlesBy("countryCode", countryCode) || [];
    if (news.length === 0) {
      const fetchedNews = await fetchNews(countryCode);
      await NewsModel.insertNewsArticles(fetchedNews);
      news = await NewsModel.getNewsArticlesBy("countryCode", countryCode);
    }

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
