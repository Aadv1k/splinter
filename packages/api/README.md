# @splinter/api

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
