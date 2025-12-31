const Article = require('../models/Article');
const logger = require('../utils/logger');

// @desc    Create a new article
// @route   POST /api/articles
// @access  Public
exports.createArticle = async (req, res, next) => {
  try {
    const { title, content, url, publishedDate } = req.body;

    // Check if article with same URL already exists
    const existingArticle = await Article.findOne({ url });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'Article with this URL already exists'
      });
    }

    const article = await Article.create({
      title,
      content,
      url,
      publishedDate: publishedDate ? new Date(publishedDate) : null
    });

    logger.info(`Article created: ${article.title}`);

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    logger.error(`Create article error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
exports.getAllArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const articles = await Article.find()
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Article.countDocuments();

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: articles
    });
  } catch (error) {
    logger.error(`Get all articles error: ${error.message}`);
    next(error);
  }
};

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public
exports.getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    logger.error(`Get article by ID error: ${error.message}`);
    next(error);
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Public
exports.updateArticle = async (req, res, next) => {
  try {
    const { title, content, url, publishedDate } = req.body;

    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if new URL conflicts with existing article
    if (url && url !== article.url) {
      const existingArticle = await Article.findOne({ url });
      if (existingArticle) {
        return res.status(400).json({
          success: false,
          message: 'Article with this URL already exists'
        });
      }
    }

    article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title: title || article.title,
        content: content || article.content,
        url: url || article.url,
        publishedDate: publishedDate ? new Date(publishedDate) : article.publishedDate
      },
      { new: true, runValidators: true }
    );

    logger.info(`Article updated: ${article.title}`);

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    logger.error(`Update article error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Public
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await Article.findByIdAndDelete(req.params.id);

    logger.info(`Article deleted: ${article.title}`);

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete article error: ${error.message}`);
    next(error);
  }
};
