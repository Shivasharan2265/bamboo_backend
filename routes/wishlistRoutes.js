const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  checkInWishlist,
  getWishlistCount,
} = require("../controller/wishlistController");

const { isAuth } = require("../config/auth");

// All routes require authentication
router.use(isAuth);



// GET /api/wishlist - Get customer's wishlist
router.get("/", getWishlist);

// POST /api/wishlist/add - Add item to wishlist
router.post("/add", addToWishlist);

// DELETE /api/wishlist/remove/:productId - Remove item from wishlist
router.delete("/remove/:productId", removeFromWishlist);

// DELETE /api/wishlist/clear - Clear entire wishlist
router.delete("/clear", clearWishlist);

// POST /api/wishlist/move-to-cart/:productId - Move item to cart
router.post("/move-to-cart/:productId", moveToCart);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get("/check/:productId", checkInWishlist);

// GET /api/wishlist/count - Get wishlist item count
router.get("/count", getWishlistCount);

module.exports = router;