const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Get customer's wishlist
const getWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;

    const wishlist = await Wishlist.getWishlistWithProducts(customerId);

    if (!wishlist) {
      return res.json({
        success: true,
        wishlist: { items: [] },
        message: "Wishlist is empty",
      });
    }

    // Filter out products that are null (inactive products)
    const validItems = wishlist.items.filter(item => item.product !== null);

    res.json({
      success: true,
      wishlist: {
        ...wishlist.toObject(),
        items: validItems,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: err.message,
    });
  }
};

// Add item to wishlist
// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, variantId, quantity = 1 } = req.body;

    console.log("🔍 Wishlist Add Request Details:", {
      customerId,
      productId,
      variantId,
      quantity,
      body: req.body
    });

    // Validate product exists and is active
    console.log(`🔍 Looking for product: ${productId}`);
    const product = await Product.findOne({ _id: productId });

    console.log("📦 Product fetched for wishlist:", product);
    
   

    // Validate variant if provided
    if (variantId && product.variants && product.variants.length > 0) {
      const variantExists = product.variants.some(
        v => v._id.toString() === variantId
      );
      if (!variantExists) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }
    }

    let wishlist = await Wishlist.findOne({ customer: customerId, isActive: true });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        customer: customerId,
        items: [{ product: productId, variant: variantId, quantity }],
      });
    } else {
      // Check if product already exists in wishlist
      const existingItem = wishlist.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      // Add new item
      wishlist.items.push({
        product: productId,
        variant: variantId,
        quantity,
      });
    }

    await wishlist.save();

    // Return populated wishlist
    const populatedWishlist = await Wishlist.getWishlistWithProducts(customerId);

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: populatedWishlist,
    });
  } catch (err) {
    console.error("❌ Wishlist add error:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: err.message,
    });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ customer: customerId, isActive: true });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Remove the item
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    // Return populated wishlist
    const populatedWishlist = await Wishlist.getWishlistWithProducts(customerId);

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: populatedWishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: err.message,
    });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;

    const wishlist = await Wishlist.findOne({ customer: customerId, isActive: true });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist: { items: [] },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: err.message,
    });
  }
};

// Move wishlist item to cart (you'll need to integrate with your cart system)
const moveToCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ customer: customerId, isActive: true });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const item = wishlist.items.find(item => item.product.toString() === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    // Here you would integrate with your cart system
    // For now, we'll just remove from wishlist and return success
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    // TODO: Add to cart logic here
    // await addToCart(customerId, {
    //   product: item.product,
    //   variant: item.variant,
    //   quantity: item.quantity
    // });

    const populatedWishlist = await Wishlist.getWishlistWithProducts(customerId);

    res.json({
      success: true,
      message: "Product moved to cart",
      wishlist: populatedWishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to move product to cart",
      error: err.message,
    });
  }
};

// Check if product is in wishlist
const checkInWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      customer: customerId,
      isActive: true,
      "items.product": productId,
    });

    const isInWishlist = !!wishlist;

    res.json({
      success: true,
      isInWishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status",
      error: err.message,
    });
  }
};

// Get wishlist count
const getWishlistCount = async (req, res) => {
  try {
    const customerId = req.user._id;

    const wishlist = await Wishlist.findOne({ customer: customerId, isActive: true });

    const count = wishlist ? wishlist.items.length : 0;

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get wishlist count",
      error: err.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  checkInWishlist,
  getWishlistCount,
};