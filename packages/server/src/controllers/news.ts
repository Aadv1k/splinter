import { Request, Response } from "express";
import fetchNews, { isCountryCodeValid } from "../services/fetchNews";
import { ServerResponse, ErrorCode } from "../types";
import { JWT_SECRET } from "../config";
import NewsModel from "../models/NewsModel";
import UserModel from "../models/UserModel";
import jwt from 'jsonwebtoken';

function isValidUUID(uuid: string): boolean {
  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[14][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidPattern.test(uuid);
}

export async function postVote(req: Request, res: Response) {
  const newsid = req.params?.id as string;
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

    if (!newsid || !isValidUUID(newsid)) {
        const errorResponse: ServerResponse = {
            status: "error",
            error: {
                code: ErrorCode.NotFound,
                message: 'Invalid ID',
                description: `the news id was not found or is invalid`,
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

  const auth = req.headers?.authorization; 

  if (!auth || Array.isArray(auth)) { 
    return res.status(401).json({
      status: "error",
      error: {
        code: ErrorCode.Unauthorized,
        message: 'Unauthorized',
        description: "did not find a valid authorization header", 
      },
    } as ServerResponse);
  }

  const jwtToken = auth.split(" ").pop();
  let parsedToken: any;

  try {
    parsedToken = jwt.verify(jwtToken as string, JWT_SECRET) as { userId: string, email: string }; 
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

  if (!data || !data.vote) {
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
  const votes = await UserModel.getVotesBy("article_id", newsid);
  const foundVote = votes.find((e: any) => e.user_id === parsedToken.userId);

    if (!foundVote) {
        try {
            await UserModel.createVote({
                vote: voteSide,
                user_id: parsedToken.userId,
                article_id: newsid
            })

            if (voteSide === "left") {
                await NewsModel.incrementLeftBias(newsid);
            } else {
                await NewsModel.decrementLeftBias(newsid);
            }

            return res.status(200).json({
                status: "success",
                message: "Vote casted successfully"
            } as ServerResponse);
        } catch (error: any) {
            return res.status(500).json({
                status: "error",
                error: {
                    code: ErrorCode.BadRequest,
                    message: "Something went wrong while casting a vote",
                    description: `internal server error while creating a vote in the db: ${error.message}`,
                },
            } as ServerResponse);
        }
    } else  {
        return res.status(400).json({
            status: "error",
            error: {
                code: ErrorCode.BadRequest,
                message: "Cannot vote twice",
                description: `unable to vote twice, already voted for ${foundVote.vote}, try /news/unvote instead`,
            },
        } as ServerResponse);
    }  
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
        total_articles: news.length,
      },
      message: `Successfully fetched and cached the news for ${countryCode}`,
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
      },
    };
    return res.status(500).json(errorResponse);
  }
}
