const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  getFeaturedBlogs,
  searchBlogs,
  incrementBlogViews,
  getRelatedBlogs,
} = require("../controller/blogController");

const { isAuth, isAdmin } = require("../config/auth");

// Public routes
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/search", searchBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/related/:slug", getRelatedBlogs);
router.get("/:id", getBlogById);
router.patch("/:id/views", incrementBlogViews);

// Protected routes (Admin only)
router.post("/", createBlog);
router.put("/:id",  updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;