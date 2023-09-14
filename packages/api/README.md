# @splinter/api

## Setup locally

You will require an API key from [newsapi](https://newsapi.org/), along with some db config. Here is an example

```.env
NEWSAPI_KEY = ""

DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASSWORD = "password"
DB_NAME = "SplinterDB"
DB_PORT = 5432
```


## Database

We use [PostgreSQL](https://www.postgresql.org/) this can be switched with any other SQL database since we don't really use any exclusive feature

- news_article
  - id (primary uuid)
  - title (text)
  - description (text)
  - cover_url (text)
  - timestamp (text)
  - url (text)
- news_bias
  - id (primary)
  - article_id (foreign news\_article.id)
  - left_bias (integer)
  - right_bias (integer)
- user 
  - id (primary)
  - email
  - password
- user_vote
  - id (primary)
  - user_id (foreign users.id)
  - article_id (foreign news\_article.id)
  - vote (left | right)

## Design

POST /v1/users/login
POST /v1/users/signup

// without API key rate-limited
// with API key, not rate-limited

GET /v1/news?
  limit=20&
  bias=left
  
```JavaScript
// Not real data
{
  "data": [
    {
      "id": "udweurowiurowur",
      "title": "What the G20 Summit success means for India and the world",
      "description": "The summit's declaration will have implications for bilateral ties, India's global influence, and efforts to revive multilateralism.",
      "source": {
        "site": "hindustantimes.com",
        "link": "https://www.hindustantimes.com/india-news/what-the-g20-summit-success-means-for-india-and-the-world-101694371976835.html"
      },
      "bias": {
        "left": 0,
        "right": 0,
        "center": 0
      },
      "timestamp": "2023-09-11T12:34:56Z"
    }
  ],
  "meta": {
    "totalCount": 1
  }
}
```

POST /v1/news/vote/:newsId

```
Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

```
{
  vote: "left"
}
```

-> OK 200, successfully voted
-> 400, attempt to post same vote, unknown bias, unknown news id
-> 401, unauthorized
-> 500 internal error
