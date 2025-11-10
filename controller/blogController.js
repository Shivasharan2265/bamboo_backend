const Blog = require("../models/Blog");

// Get all blogs with pagination and filtering
const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      // status = "published",
      featured,
      search,
      tag,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { };

    // Filter by featured
    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { "title.en": { $regex: search, $options: "i" } },
        { "content.en": { $regex: search, $options: "i" } },
        { "excerpt.en": { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email");

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email");

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Create new blog
// Create new blog
const createBlog = async (req, res) => {
  try {
    console.log("📝 Creating blog with data:", req.body);
    
    // Generate slug from title
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
        .trim();
    };

    const slug = generateSlug(req.body.title.en || 'untitled-blog');
    
    const blogData = {
      ...req.body,
      slug: slug,
      author: req.user ? req.user._id : null, // Handle missing user
    };

    // Set publishedAt if status is published
    if (req.body.status === "published" && !req.body.publishedAt) {
      blogData.publishedAt = new Date();
    }

    console.log("📦 Final blog data:", blogData);

    const blog = new Blog(blogData);
    await blog.save();

    // Only populate if author exists
    if (blog.author) {
      await blog.populate("author", "name email");
    }

    console.log("✅ Blog created successfully:", blog._id);

    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (err) {
    console.error("❌ Blog creation error:", err);
    console.error("❌ Error details:", {
      message: err.message,
      code: err.code,
      keyValue: err.keyValue,
      stack: err.stack
    });
    
    if (err.code === 11000) {
      // Handle duplicate slug - add timestamp
      if (err.keyValue && err.keyValue.slug) {
        const timestamp = Date.now();
        const newSlug = `${err.keyValue.slug}-${timestamp}`;
        
        // Retry with new slug
        req.body.slug = newSlug;
        return createBlog(req, res);
      }
      return res.status(400).send({
        message: "Blog with this slug already exists",
      });
    }
    res.status(500).send({
      message: err.message,
    });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    // Set publishedAt if status is being changed to published
    if (req.body.status === "published" && blog.status !== "published") {
      req.body.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("author", "name email");

    res.json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send({
        message: "Blog with this slug already exists",
      });
    }
    res.status(500).send({
      message: err.message,
    });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      message: "Blog deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({
     
      featured: true,
    })
      .populate("author", "name email")
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json(blogs);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Search blogs
const searchBlogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).send({
        message: "Search query is required",
      });
    }

    const query = {
      $or: [
        { "title.en": { $regex: q, $options: "i" } },
        { "content.en": { $regex: q, $options: "i" } },
        { "excerpt.en": { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    };

    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      searchQuery: q,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Increment blog views
const incrementBlogViews = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    res.json({
      message: "View count updated",
      views: blog.views,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get related blogs
const getRelatedBlogs = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const currentBlog = await Blog.findOne({ slug: req.params.slug });

    if (!currentBlog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: currentBlog._id },
      tags: { $in: currentBlog.tags },
    })
      .populate("author", "name email")
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json(relatedBlogs);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  searchBlogs,
  incrementBlogViews,
  getRelatedBlogs,
};