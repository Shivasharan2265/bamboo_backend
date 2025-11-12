require("dotenv").config();
console.log("✅ ENCRYPT_PASSWORD =", process.env.ENCRYPT_PASSWORD);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const { connectDB } = require("../config/db");
const productRoutes = require("../routes/productRoutes");
const customerRoutes = require("../routes/customerRoutes");
const adminRoutes = require("../routes/adminRoutes");
const orderRoutes = require("../routes/orderRoutes");
const customerOrderRoutes = require("../routes/customerOrderRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const couponRoutes = require("../routes/couponRoutes");
const attributeRoutes = require("../routes/attributeRoutes");
const settingRoutes = require("../routes/settingRoutes");
const currencyRoutes = require("../routes/currencyRoutes");
const languageRoutes = require("../routes/languageRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const blogRoutes = require("../routes/blogRoutes");
const addressRoutes = require("../routes/addressRoutes");
const wishlistRoutes = require("../routes/wishlistRoutes");

const { isAuth, isAdmin } = require("../config/auth");

// ✅ Connect to MongoDB
connectDB();

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "4mb" }));
app.use(helmet());

// ✅ Allow CORS for all origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("App works properly!");
});

// ✅ API ROUTES
app.use("/api/products/", productRoutes);
app.use("/api/category/", categoryRoutes);
app.use("/api/coupon/", couponRoutes);
app.use("/api/customer/", customerRoutes);
app.use("/api/order/", isAuth, customerOrderRoutes);
app.use("/api/attributes/", attributeRoutes);
app.use("/api/setting/", settingRoutes);
app.use("/api/currency/", isAuth, currencyRoutes);
app.use("/api/language/", languageRoutes);
app.use("/api/notification/", isAuth, notificationRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/orders/", orderRoutes);
app.use("/api/blogs/", blogRoutes);
app.use("/api/wishlist/", wishlistRoutes);
app.use("/api/address/", isAuth, addressRoutes);

// ✅ Serve static files from /public
app.use("/static", express.static("public"));

// ✅ Serve frontend (for production)
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "build");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // Development fallback
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.send("Backend API is running fine 👍");
    } else {
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
}

// ✅ Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("❌ Global Error:", err.message);
  res.status(400).json({ message: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
