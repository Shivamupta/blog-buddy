const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    url: {
      type: String,
      required: [true, 'Article URL is required'],
      unique: true,
      trim: true
    },
    publishedDate: {
      type: Date,
      default: null
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
articleSchema.index({ title: 'text', content: 'text' });
articleSchema.index({ publishedDate: -1 });
articleSchema.index({ url: 1 });

module.exports = mongoose.model('Article', articleSchema);
