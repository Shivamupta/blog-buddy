# BeyondChats Article Scraper API

A Node.js + Express + MongoDB project that scrapes blog articles from BeyondChats and provides CRUD REST APIs.

## Features

- Scrapes the 5 oldest blog articles from the last page of https://beyondchats.com/blogs/
- Extracts title, full content, URL, and published date
- Stores articles in MongoDB
- Full CRUD REST API for article management
- Proper error handling and logging

## Project Structure

```
/src
  /config
    database.js       # MongoDB connection configuration
  /controllers
    articleController.js  # Request handlers for article operations
  /models
    Article.js        # Mongoose schema for articles
  /routes
    articleRoutes.js  # Express route definitions
  /services
    scraperService.js # Web scraping logic
  /utils
    logger.js         # Custom logging utility
  /scripts
    scrapeArticles.js # Standalone scraper script
  index.js            # Application entry point
```

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone or copy this project to your local machine

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/beyondchats_articles
PORT=5000
NODE_ENV=development
BLOG_URL=https://beyondchats.com/blogs/
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Running the Scraper

To scrape articles and save them to MongoDB:

```bash
npm run scrape
```

This will:
1. Connect to MongoDB
2. Navigate to the last page of the BeyondChats blog
3. Find the 5 oldest articles
4. Scrape full content from each article
5. Save to MongoDB (skipping duplicates)

## API Routes

### Base URL
```
http://localhost:5000/api/articles
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get all articles (paginated) |
| GET | `/api/articles/:id` | Get single article by ID |
| POST | `/api/articles` | Create new article |
| PUT | `/api/articles/:id` | Update article |
| DELETE | `/api/articles/:id` | Delete article |

### Query Parameters (GET all)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Items per page |
| `sort` | -createdAt | Sort field (prefix with - for descending) |

### Request/Response Examples

#### Create Article
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Article",
    "content": "This is the article content...",
    "url": "https://example.com/article",
    "publishedDate": "2024-01-15"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Sample Article",
    "content": "This is the article content...",
    "url": "https://example.com/article",
    "publishedDate": "2024-01-15T00:00:00.000Z",
    "scrapedAt": "2024-01-20T10:30:00.000Z",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

#### Get All Articles
```bash
curl http://localhost:5000/api/articles?page=1&limit=5
```

Response:
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "page": 1,
  "pages": 3,
  "data": [...]
}
```

#### Get Article by ID
```bash
curl http://localhost:5000/api/articles/65a1b2c3d4e5f6g7h8i9j0k1
```

#### Update Article
```bash
curl -X PUT http://localhost:5000/api/articles/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'
```

#### Delete Article
```bash
curl -X DELETE http://localhost:5000/api/articles/65a1b2c3d4e5f6g7h8i9j0k1
```

## How Scraping Works

1. **Pagination Discovery**: The scraper first fetches the main blog page and analyzes pagination links to find the last page number.

2. **Last Page Fetch**: It then navigates to the last page of the blog (e.g., `/page/10/`).

3. **Article Link Extraction**: Using Cheerio, it parses the HTML and extracts all blog post links using multiple CSS selectors to handle different WordPress themes.

4. **Oldest Articles Selection**: From the extracted links, it takes the last 5 articles (which are typically the oldest on that page).

5. **Content Scraping**: For each article URL, it:
   - Fetches the full page HTML
   - Extracts the title (from h1, title tag, or common WordPress classes)
   - Extracts the full content (from article body, paragraphs)
   - Extracts the published date (from time tags, meta tags, or date classes)

6. **Rate Limiting**: A 1-second delay is added between requests to be respectful to the server.

7. **Duplicate Prevention**: Before saving, it checks if an article with the same URL already exists.

## Error Handling

- All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

- HTTP status codes:
  - `200` - Success
  - `201` - Created
  - `400` - Bad Request
  - `404` - Not Found
  - `500` - Internal Server Error

## Logging

All operations are logged with timestamps:
```
[2024-01-20T10:30:00.000Z] [INFO] Server running on port 5000
[2024-01-20T10:30:01.000Z] [INFO] MongoDB Connected: localhost
[2024-01-20T10:30:02.000Z] [INFO] Scraping: https://beyondchats.com/...
[2024-01-20T10:30:03.000Z] [ERROR] Failed to fetch: Connection timeout
```

## Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## License

MIT
