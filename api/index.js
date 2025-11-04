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
const { isAuth, isAdmin } = require("../config/auth");

connectDB();
const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "4mb" }));
app.use(helmet());
app.options("*", cors());
app.use(cors());

// Root route
app.get("/", (req, res) => {
  res.send("App works properly!");
});

// ✅ API ROUTES - Place all API routes here
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

// Serve static files from the "public" directory
app.use("/static", express.static("public"));

// ✅ Serve frontend only in production - This should be LAST
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "build");
  app.use(express.static(buildPath));

  // Catch-all handler for production: send back React's index.html file.
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // Development catch-all handler
  app.get("*", (req, res) => {
    // Only return the generic message for unmatched routes that aren't API routes
    if (!req.path.startsWith('/api/')) {
      res.send("Backend API is running fine 👍");
    } else {
      // For unmatched API routes, return 404
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));