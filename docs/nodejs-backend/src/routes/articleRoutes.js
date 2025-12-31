const express = require('express');
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

// @route   /api/articles
router.route('/')
  .get(getAllArticles)
  .post(createArticle);

// @route   /api/articles/:id
router.route('/:id')
  .get(getArticleById)
  .put(updateArticle)
  .delete(deleteArticle);

module.exports = router;
