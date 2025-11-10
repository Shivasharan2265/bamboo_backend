const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      en: { type: String, required: true },
    },
    excerpt: {
      en: { type: String },
    },
    featuredImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      // required: true, // REMOVE THIS LINE FOR NOW
    },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    metaTitle: {
      en: { type: String },
    },
    metaDescription: {
      en: { type: String },
    },
    metaKeywords: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number, // in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug BEFORE validation
blogSchema.pre("validate", function (next) {
  if (this.title && this.title.en && !this.slug) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Calculate reading time before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("content.en")) {
    const wordsPerMinute = 200;
    const wordCount = this.content.en.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);