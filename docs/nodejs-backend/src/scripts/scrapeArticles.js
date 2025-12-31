/**
 * Standalone script to scrape articles and save to MongoDB
 * Run with: npm run scrape
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const { scrapeOldestArticles } = require('../services/scraperService');
const logger = require('../utils/logger');

const runScraper = async () => {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Run scraper
    logger.info('Starting article scraping...');
    const articles = await scrapeOldestArticles();

    if (articles.length === 0) {
      logger.warn('No articles were scraped');
      process.exit(0);
    }

    // Save articles to database
    logger.info(`Saving ${articles.length} articles to database...`);
    
    let savedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      try {
        // Check if article already exists
        const existing = await Article.findOne({ url: article.url });
        if (existing) {
          logger.info(`Skipping duplicate: ${article.title}`);
          skippedCount++;
          continue;
        }

        // Save new article
        await Article.create(article);
        logger.info(`Saved: ${article.title}`);
        savedCount++;
      } catch (err) {
        logger.error(`Failed to save article: ${err.message}`);
      }
    }

    logger.info(`Scraping complete! Saved: ${savedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    logger.error(`Scraper script failed: ${error.message}`);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  }
};

runScraper();
