const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const BLOG_URL = process.env.BLOG_URL || 'https://beyondchats.com/blogs/';

/**
 * Fetches HTML content from a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - HTML content
 */
const fetchHTML = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch ${url}: ${error.message}`);
    throw error;
  }
};

/**
 * Finds the last page number from pagination
 * @param {string} html - HTML content of the blog listing page
 * @returns {number} - Last page number
 */
const findLastPageNumber = (html) => {
  const $ = cheerio.load(html);
  
  // Try different pagination selectors
  let lastPage = 1;
  
  // Look for pagination links
  const paginationLinks = $('a[href*="/page/"]');
  
  paginationLinks.each((i, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/page\/(\d+)/);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum > lastPage) {
        lastPage = pageNum;
      }
    }
  });

  // Also check for numbered pagination buttons
  $('.pagination a, .nav-links a, .page-numbers').each((i, el) => {
    const text = $(el).text().trim();
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > lastPage) {
      lastPage = num;
    }
  });

  logger.info(`Found last page number: ${lastPage}`);
  return lastPage;
};

/**
 * Extracts article links from the blog listing page
 * @param {string} html - HTML content
 * @returns {Array<{url: string, title: string}>} - Array of article info
 */
const extractArticleLinks = (html) => {
  const $ = cheerio.load(html);
  const articles = [];

  // Try different selectors for blog post links
  const selectors = [
    'article a[href*="beyondchats.com"]',
    '.post a[href*="beyondchats.com"]',
    '.blog-post a',
    'h2 a',
    'h3 a',
    '.entry-title a',
    '.post-title a',
    'a.read-more',
    '.card a[href*="/"]'
  ];

  // Try each selector
  for (const selector of selectors) {
    $(selector).each((i, el) => {
      const url = $(el).attr('href');
      const title = $(el).text().trim() || $(el).attr('title') || '';
      
      if (url && url.includes('beyondchats.com') && !url.includes('/page/') && !url.includes('/category/')) {
        // Avoid duplicates
        if (!articles.find(a => a.url === url)) {
          articles.push({ url, title });
        }
      }
    });
  }

  // If still no articles found, try a broader approach
  if (articles.length === 0) {
    $('a').each((i, el) => {
      const url = $(el).attr('href') || '';
      const title = $(el).text().trim();
      
      // Filter for blog post URLs (typically have date or post structure)
      if (url.includes('beyondchats.com') && 
          !url.includes('/page/') && 
          !url.includes('/category/') &&
          !url.includes('/tag/') &&
          !url.includes('#') &&
          url !== BLOG_URL &&
          title.length > 10) {
        if (!articles.find(a => a.url === url)) {
          articles.push({ url, title });
        }
      }
    });
  }

  return articles;
};

/**
 * Extracts full content from an individual article page
 * @param {string} url - Article URL
 * @returns {Promise<Object>} - Article data
 */
const scrapeArticleContent = async (url) => {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Extract title
    let title = $('h1').first().text().trim() ||
                $('title').text().trim() ||
                $('.entry-title').text().trim() ||
                $('.post-title').text().trim();

    // Clean up title (remove site name if appended)
    title = title.split('|')[0].split('-')[0].trim();

    // Extract content
    let content = '';
    const contentSelectors = [
      'article .entry-content',
      '.post-content',
      '.article-content',
      '.blog-content',
      'article p',
      '.content p',
      'main p'
    ];

    for (const selector of contentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        content = elements.map((i, el) => $(el).text().trim()).get().join('\n\n');
        if (content.length > 100) break;
      }
    }

    // Fallback: get all paragraphs from article or main
    if (content.length < 100) {
      content = $('article, main, .post, .blog-post')
        .find('p')
        .map((i, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join('\n\n');
    }

    // Extract published date
    let publishedDate = null;
    const dateSelectors = [
      'time[datetime]',
      '.post-date',
      '.entry-date',
      '.published',
      '.date',
      'meta[property="article:published_time"]'
    ];

    for (const selector of dateSelectors) {
      const dateEl = $(selector).first();
      if (dateEl.length) {
        const dateStr = dateEl.attr('datetime') || 
                       dateEl.attr('content') || 
                       dateEl.text().trim();
        if (dateStr) {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            publishedDate = parsed;
            break;
          }
        }
      }
    }

    return {
      title,
      content,
      url,
      publishedDate,
      scrapedAt: new Date()
    };
  } catch (error) {
    logger.error(`Failed to scrape article ${url}: ${error.message}`);
    return null;
  }
};

/**
 * Main scraping function - scrapes 5 oldest articles from the last page
 * @returns {Promise<Array>} - Array of scraped articles
 */
const scrapeOldestArticles = async () => {
  try {
    logger.info('Starting scrape process...');

    // Step 1: Fetch the main blog page to find pagination
    const mainPageHtml = await fetchHTML(BLOG_URL);
    const lastPageNum = findLastPageNumber(mainPageHtml);

    // Step 2: Fetch the last page
    const lastPageUrl = lastPageNum > 1 
      ? `${BLOG_URL}page/${lastPageNum}/` 
      : BLOG_URL;
    
    logger.info(`Fetching last page: ${lastPageUrl}`);
    const lastPageHtml = await fetchHTML(lastPageUrl);

    // Step 3: Extract article links from the last page
    const articleLinks = extractArticleLinks(lastPageHtml);
    logger.info(`Found ${articleLinks.length} article links on last page`);

    if (articleLinks.length === 0) {
      logger.warn('No articles found on the last page');
      return [];
    }

    // Step 4: Take the last 5 (oldest) articles
    // On paginated blogs, oldest articles are typically at the end of the last page
    const oldestArticles = articleLinks.slice(-5);
    logger.info(`Scraping ${oldestArticles.length} oldest articles`);

    // Step 5: Scrape full content for each article
    const scrapedArticles = [];
    for (const article of oldestArticles) {
      logger.info(`Scraping: ${article.url}`);
      const fullArticle = await scrapeArticleContent(article.url);
      if (fullArticle) {
        scrapedArticles.push(fullArticle);
      }
      // Add delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(`Successfully scraped ${scrapedArticles.length} articles`);
    return scrapedArticles;

  } catch (error) {
    logger.error(`Scraping failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  scrapeOldestArticles,
  scrapeArticleContent,
  fetchHTML,
  findLastPageNumber,
  extractArticleLinks
};
